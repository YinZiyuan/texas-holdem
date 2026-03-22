import { useState } from 'react'

export default function ActionPanel({ socket, roomCode, gameState, myId }) {
  const [raiseAmount, setRaiseAmount] = useState(0)
  if (!gameState?.game) return null
  const { game } = gameState
  if (game.phase === 'ended' || game.phase === 'waiting' || game.phase === 'showdown') {
    return (
      <div style={{ textAlign: 'center', padding: 16 }}>
        {game.winner && <div style={{ color: '#ffd43b', marginBottom: 12, fontSize: 18 }}>
          🏆 {gameState.players.find(p => p.id === game.winner)?.name} 赢了！
        </div>}
        <button onClick={() => socket.emit('game:next-hand', { code: roomCode })}
          style={{ padding: '10px 24px', background: '#2f9e44', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, cursor: 'pointer' }}>
          下一手 →
        </button>
      </div>
    )
  }
  if (game.currentPlayerId !== myId) {
    return <div style={{ textAlign: 'center', color: '#868e96', padding: 16 }}>等待其他玩家操作...</div>
  }
  const act = (action, amount) => socket.emit('game:action', { code: roomCode, action, amount })
  const canCheck = game.players.find(p => p.id === myId)?.bet === game.currentBet
  const myChips = game.players.find(p => p.id === myId)?.chips || 0
  const callAmount = game.currentBet - (game.players.find(p => p.id === myId)?.bet || 0)

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', padding: 16, flexWrap: 'wrap' }}>
      <button onClick={() => act('fold')} style={btnStyle('#c92a2a')}>弃牌</button>
      {canCheck
        ? <button onClick={() => act('check')} style={btnStyle('#1864ab')}>过牌</button>
        : <button onClick={() => act('call')} style={btnStyle('#1864ab')}>跟注 ({callAmount})</button>
      }
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input type="range" min={game.bigBlind || 20} max={myChips} value={raiseAmount || (game.bigBlind || 20)}
          onChange={e => setRaiseAmount(Number(e.target.value))}
          style={{ width: 80 }} />
        <button onClick={() => act('raise', raiseAmount || (game.bigBlind || 20))} style={btnStyle('#2f9e44')}>
          加注 ({raiseAmount || game.bigBlind || 20})
        </button>
        <button onClick={() => act('raise', myChips)} style={btnStyle('#f59f00')}>全押</button>
      </div>
    </div>
  )
}

const btnStyle = (bg) => ({
  padding: '10px 18px', background: bg, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 'bold'
})
