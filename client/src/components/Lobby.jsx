import { useState } from 'react'

export default function Lobby({ socket, onJoined }) {
  const [tab, setTab] = useState('create')
  const [playerName, setPlayerName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [settings, setSettings] = useState({
    smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 6
  })

  const handleCreate = () => {
    if (!playerName.trim()) return setError('请输入昵称')
    socket.emit('room:create', { ...settings, playerName }, (res) => {
      if (res.ok) onJoined(res.code, res.state, playerName)
      else setError(res.error)
    })
  }

  const handleJoin = () => {
    if (!playerName.trim()) return setError('请输入昵称')
    if (!code.trim()) return setError('请输入房间号')
    socket.emit('room:join', { code: code.toUpperCase(), playerName }, (res) => {
      if (res.ok) onJoined(code.toUpperCase(), res.state, playerName)
      else setError(res.error)
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>♠ Texas Hold'em</h1>

        <div style={styles.segmentControl}>
          <button
            style={{...styles.segmentBtn, ...(tab === 'create' ? styles.segmentActive : {})}}
            onClick={() => setTab('create')}
          >创建房间</button>
          <button
            style={{...styles.segmentBtn, ...(tab === 'join' ? styles.segmentActive : {})}}
            onClick={() => setTab('join')}
          >加入房间</button>
        </div>

        <input
          style={styles.input}
          placeholder="你的昵称"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
        />

        {tab === 'join' ? (
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

        <button style={styles.primaryBtn} onClick={tab === 'create' ? handleCreate : handleJoin}>
          {tab === 'create' ? '创建房间' : '加入房间'}
        </button>
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
  title: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  segmentControl: {
    display: 'flex',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 10,
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  segmentActive: {
    background: '#0a84ff',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(10,132,255,0.4)',
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
