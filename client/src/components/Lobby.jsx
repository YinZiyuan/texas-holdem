import { useState, useEffect } from 'react'

export default function Lobby({ socket, onJoined }) {
  const [view, setView] = useState('list') // 'list', 'create', 'join', 'verify'
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [code, setCode] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [roomList, setRoomList] = useState([])
  const [settings, setSettings] = useState({
    smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 6
  })

  // Fetch room list on mount and every 3 seconds
  useEffect(() => {
    const fetchRooms = () => {
      socket.emit('room:list', (res) => {
        if (res.ok) setRoomList(res.rooms)
      })
    }
    fetchRooms()
    const interval = setInterval(fetchRooms, 3000)
    return () => clearInterval(interval)
  }, [socket])

  const handleCreate = () => {
    if (!playerName.trim()) return setError('请输入昵称')
    const name = roomName.trim() || `房间 ${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    socket.emit('room:create', { ...settings, playerName, name }, (res) => {
      if (res.ok) onJoined(res.code, res.state, playerName)
      else setError(res.error)
    })
  }

  const handleJoin = (roomCode) => {
    if (!playerName.trim()) return setError('请输入昵称')
    const joinCode = roomCode || code
    if (!joinCode.trim()) return setError('请输入房间号')
    socket.emit('room:join', { code: joinCode.toUpperCase(), playerName }, (res) => {
      if (res.ok) onJoined(joinCode.toUpperCase(), res.state, playerName)
      else setError(res.error)
    })
  }

  const handleVerifyJoin = () => {
    if (!playerName.trim()) return setError('请输入昵称')
    if (!verifyCode.trim()) return setError('请输入房间号')
    if (verifyCode.toUpperCase() !== selectedRoom?.code) {
      return setError('房间号错误，请重新输入')
    }
    socket.emit('room:join', { code: verifyCode.toUpperCase(), playerName }, (res) => {
      if (res.ok) onJoined(verifyCode.toUpperCase(), res.state, playerName)
      else setError(res.error)
    })
  }

  const openVerify = (room) => {
    setSelectedRoom(room)
    setVerifyCode('')
    setError('')
    setView('verify')
  }

  // Form view for creating/joining
  if (view === 'create' || view === 'join') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <button style={styles.backBtn} onClick={() => { setView('list'); setError('') }}>
              ← 返回
            </button>
            <h1 style={styles.titleSmall}>{view === 'create' ? '创建房间' : '加入房间'}</h1>
            <div style={styles.placeholder}></div>
          </div>

          <input
            style={styles.input}
            placeholder="你的昵称"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
          />

          {view === 'create' && (
            <input
              style={styles.input}
              placeholder="房间名称（可选）"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              maxLength={20}
            />
          )}

          {view === 'join' ? (
            <input
              style={{...styles.input, ...styles.codeInput}}
              placeholder="房间号"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          ) : (
            <div style={styles.settings}>
              <SettingRow label="初始筹码" value={settings.startingChips} onChange={v => setSettings(s => ({...s, startingChips: v}))} />
              <SettingRow label="小盲注" value={settings.smallBlind} onChange={v => setSettings(s => ({...s, smallBlind: v}))} />
              <SettingRow label="大盲注" value={settings.bigBlind} onChange={v => setSettings(s => ({...s, bigBlind: v}))} />
              <SettingRow label="最大人数" value={settings.maxPlayers} onChange={v => setSettings(s => ({...s, maxPlayers: v}))} min={2} max={9} />
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.primaryBtn} onClick={view === 'create' ? handleCreate : () => handleJoin()}>
            {view === 'create' ? '创建房间' : '加入房间'}
          </button>
        </div>
      </div>
    )
  }

  // Verify room code modal
  if (view === 'verify' && selectedRoom) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <button style={styles.backBtn} onClick={() => { setView('list'); setError(''); setSelectedRoom(null) }}>
              ← 返回
            </button>
            <h1 style={styles.titleSmall}>加入房间</h1>
            <div style={styles.placeholder}></div>
          </div>

          <div style={styles.verifyRoomInfo}>
            <div style={styles.verifyRoomName}>{selectedRoom.name}</div>
            <div style={styles.verifyRoomMeta}>
              {selectedRoom.players}/{selectedRoom.maxPlayers} 人 · 盲注 {selectedRoom.bigBlind} · 筹码 {selectedRoom.startingChips}
            </div>
          </div>

          <input
            style={styles.input}
            placeholder="你的昵称"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
          />

          <input
            style={{...styles.input, ...styles.codeInput}}
            placeholder="请输入6位房间号"
            value={verifyCode}
            onChange={e => setVerifyCode(e.target.value.toUpperCase())}
            maxLength={6}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.primaryBtn} onClick={handleVerifyJoin}>
            确认加入
          </button>
        </div>
      </div>
    )
  }

  // Main lobby view with room list
  return (
    <div style={styles.container}>
      <div style={styles.lobbyCard}>
        {/* Header with title and action buttons */}
        <div style={styles.headerBar}>
          <h1 style={styles.logo}>♠ Texas Hold'em</h1>
          <div style={styles.headerActions}>
            <button style={styles.secondaryBtn} onClick={() => setView('join')}>
              加入房间
            </button>
            <button style={styles.primaryBtnSmall} onClick={() => setView('create')}>
              创建房间
            </button>
          </div>
        </div>

        {/* Room list area */}
        <div style={styles.roomListArea}>
          {roomList.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎮</div>
              <p style={styles.emptyText}>暂无可用房间</p>
              <p style={styles.emptySubtext}>创建一个房间开始游戏</p>
            </div>
          ) : (
            <div style={styles.roomList}>
              <h3 style={styles.listTitle}>房间列表</h3>
              {roomList.map(room => (
                <div key={room.code} style={styles.roomItem}>
                  <div style={styles.roomInfo}>
                    <div style={styles.roomName}>{room.name}</div>
                    <div style={styles.roomMeta}>
                      {room.players}/{room.maxPlayers} 人 · 盲注 {room.bigBlind} · 筹码 {room.startingChips}
                    </div>
                  </div>
                  <button
                    style={styles.joinRoomBtn}
                    onClick={() => openVerify(room)}
                  >
                    加入
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick join section */}
        <div style={styles.quickJoin}>
          <input
            style={styles.quickInput}
            placeholder="输入房间号快速加入"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button
            style={styles.quickBtn}
            onClick={() => code.trim() && handleJoin()}
            disabled={!code.trim()}
          >
            进入
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingRow({ label, value, onChange, min = 1 }) {
  return (
    <div style={styles.settingRow}>
      <span style={styles.settingLabel}>{label}</span>
      <input
        type="number"
        style={styles.settingInput}
        value={value}
        min={min}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #000000 0%, #1c1c1e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  // Lobby main styles
  lobbyCard: {
    background: 'rgba(28, 28, 30, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    width: '100%',
    maxWidth: 600,
    minHeight: 500,
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    letterSpacing: -0.3,
  },
  headerActions: {
    display: 'flex',
    gap: 12,
  },
  secondaryBtn: {
    padding: '10px 18px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryBtnSmall: {
    padding: '10px 18px',
    borderRadius: 12,
    border: 'none',
    background: '#0a84ff',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(10,132,255,0.4)',
    transition: 'all 0.2s',
  },
  roomListArea: {
    flex: 1,
    padding: '20px 24px',
    overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 500,
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    margin: 0,
  },
  // Room list styles
  roomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  listTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: '0 0 8px 0',
  },
  roomItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.2s',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
  },
  roomMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  joinRoomBtn: {
    padding: '10px 24px',
    borderRadius: 12,
    border: 'none',
    background: '#30d158',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(48,209,88,0.4)',
  },
  quickJoin: {
    display: 'flex',
    gap: 12,
    padding: '20px 24px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)',
  },
  quickInput: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 16,
    letterSpacing: 4,
    textAlign: 'center',
    outline: 'none',
  },
  quickBtn: {
    padding: '14px 28px',
    borderRadius: 12,
    border: 'none',
    background: '#30d158',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  // Verify view styles
  verifyRoomInfo: {
    background: 'rgba(10,132,255,0.1)',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 20,
    textAlign: 'center',
    border: '1px solid rgba(10,132,255,0.2)',
  },
  verifyRoomName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 6,
  },
  verifyRoomMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  // Form view styles
  card: {
    background: 'rgba(28, 28, 30, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  },
  titleSmall: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  placeholder: {
    width: 60,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s',
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 24,
    fontWeight: 600,
  },
  settings: {
    marginBottom: 16,
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  settingLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  settingInput: {
    width: 80,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  error: {
    color: '#ff453a',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    padding: '16px 24px',
    borderRadius: 14,
    border: 'none',
    background: '#0a84ff',
    color: '#fff',
    fontSize: 17,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(10,132,255,0.4)',
    transition: 'all 0.2s',
  },
}
