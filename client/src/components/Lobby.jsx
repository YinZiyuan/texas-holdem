import { useState } from 'react'

export default function Lobby({ socket, onJoined }) {
  const [tab, setTab] = useState('create') // 'create' | 'join'
  const [playerName, setPlayerName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  // Create room settings
  const [settings, setSettings] = useState({
    smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 6
  })

  const handleCreate = () => {
    if (!playerName.trim()) return setError('Enter your name')
    socket.emit('room:create', { ...settings, playerName }, (res) => {
      if (res.ok) onJoined(res.code, res.state, playerName)
      else setError(res.error)
    })
  }

  const handleJoin = () => {
    if (!playerName.trim()) return setError('Enter your name')
    if (!code.trim()) return setError('Enter room code')
    socket.emit('room:join', { code: code.toUpperCase(), playerName }, (res) => {
      if (res.ok) onJoined(code.toUpperCase(), res.state, playerName)
      else setError(res.error)
    })
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, background: '#1a3a2a', borderRadius: 16, color: '#fff' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>♠ Texas Hold'em</h1>

      <div style={{ display: 'flex', marginBottom: 20 }}>
        {['create', 'join'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: 10, background: tab === t ? '#2f9e44' : '#0f2018', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 8, margin: '0 4px' }}>
            {t === 'create' ? '创建房间' : '加入房间'}
          </button>
        ))}
      </div>

      <input placeholder="你的昵称" value={playerName} onChange={e => setPlayerName(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #2f9e44', background: '#0f2018', color: '#fff', boxSizing: 'border-box' }} />

      {tab === 'join' ? (
        <input placeholder="房间号 (6位)" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 8, border: '1px solid #2f9e44', background: '#0f2018', color: '#fff', boxSizing: 'border-box', letterSpacing: 4, textAlign: 'center', fontSize: 20 }} />
      ) : (
        <div style={{ marginBottom: 12 }}>
          {[['startingChips', '初始筹码'], ['smallBlind', '小盲注'], ['bigBlind', '大盲注'], ['maxPlayers', '最大人数']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#8ce99a', fontSize: 14 }}>{label}</span>
              <input type="number" value={settings[key]} onChange={e => setSettings(s => ({ ...s, [key]: Number(e.target.value) }))}
                style={{ width: 90, padding: '4px 8px', borderRadius: 6, border: '1px solid #2f9e44', background: '#0f2018', color: '#fff' }} />
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: '#ff6b6b', marginBottom: 8, fontSize: 14 }}>{error}</div>}

      <button onClick={tab === 'create' ? handleCreate : handleJoin}
        style={{ width: '100%', padding: 12, background: '#2f9e44', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, cursor: 'pointer', fontWeight: 'bold' }}>
        {tab === 'create' ? '创建房间' : '加入房间'}
      </button>
    </div>
  )
}
