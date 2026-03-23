import { useState } from 'react'

export default function ActionPanel({ socket, roomCode, gameState, myId }) {
  const [raiseAmount, setRaiseAmount] = useState(0)

  if (!gameState?.game) return null
  const { game } = gameState

  // Game ended or waiting
  if (game.phase === 'ended' || game.phase === 'waiting' || game.phase === 'showdown') {
    return (
      <div style={styles.container}>
        {game.winner && (
          <div style={styles.winner}>
            🏆 {gameState.players.find(p => p.id === game.winner)?.name} 赢了！
          </div>
        )}
        <button
          style={styles.primaryBtn}
          onClick={() => socket.emit('game:next-hand', { code: roomCode })}
        >
          下一手
        </button>
      </div>
    )
  }

  // Not my turn
  if (game.currentPlayerId !== myId) {
    return (
      <div style={styles.container}>
        <div style={styles.waiting}>等待其他玩家...</div>
      </div>
    )
  }

  const myPlayer = game.players.find(p => p.id === myId)
  const canCheck = myPlayer?.bet === game.currentBet
  const callAmount = game.currentBet - (myPlayer?.bet || 0)
  const myChips = myPlayer?.chips || 0
  const minRaise = game.bigBlind || 20
  const pot = game.pot || 0

  const act = (action, amount) => {
    socket.emit('game:action', { code: roomCode, action, amount })
  }

  const handleRaiseChange = (val) => {
    const num = parseInt(val) || 0
    setRaiseAmount(Math.max(minRaise, Math.min(num, myChips)))
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainActions}>
        <button style={{...styles.btn, ...styles.foldBtn}} onClick={() => act('fold')}>
          弃牌
        </button>

        {canCheck ? (
          <button style={{...styles.btn, ...styles.checkBtn}} onClick={() => act('check')}>
            过牌
          </button>
        ) : (
          <button style={{...styles.btn, ...styles.callBtn}} onClick={() => act('call')}>
            跟注 {callAmount > 0 && <span style={styles.amount}>{callAmount}</span>}
          </button>
        )}
      </div>

      <div style={styles.raiseSection}>
        <div style={styles.quickBtns}>
          <button style={styles.quickBtn} onClick={() => setRaiseAmount(Math.min(minRaise * 2, myChips))}>
            2xBB
          </button>
          <button style={styles.quickBtn} onClick={() => setRaiseAmount(Math.min(pot, myChips))}>
            底池
          </button>
          <button style={styles.quickBtn} onClick={() => setRaiseAmount(Math.min(pot * 2, myChips))}>
            2x底池
          </button>
          <button style={{...styles.quickBtn, ...styles.allInBtn}} onClick={() => setRaiseAmount(myChips)}>
            全押
          </button>
        </div>

        <div style={styles.raiseInputRow}>
          <input
            type="number"
            style={styles.raiseInput}
            value={raiseAmount || minRaise}
            min={minRaise}
            max={myChips}
            onChange={e => handleRaiseChange(e.target.value)}
          />
          <button
            style={{...styles.btn, ...styles.raiseBtn}}
            onClick={() => act('raise', raiseAmount || minRaise)}
            disabled={!raiseAmount || raiseAmount < minRaise}
          >
            加注
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: 'rgba(28,28,30,0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px 20px 0 0',
    padding: '20px 24px 32px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  mainActions: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    padding: '16px 20px',
    borderRadius: 14,
    border: 'none',
    fontSize: 17,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  foldBtn: {
    background: 'rgba(255,69,58,0.9)',
    color: '#fff',
  },
  checkBtn: {
    background: 'rgba(10,132,255,0.9)',
    color: '#fff',
  },
  callBtn: {
    background: 'rgba(10,132,255,0.9)',
    color: '#fff',
  },
  raiseBtn: {
    background: 'rgba(48,209,88,0.9)',
    color: '#fff',
    padding: '14px 24px',
  },
  amount: {
    fontSize: 14,
    opacity: 0.9,
    marginLeft: 4,
  },
  raiseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  quickBtns: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  quickBtn: {
    padding: '8px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  allInBtn: {
    background: 'rgba(255,159,10,0.9)',
  },
  raiseInputRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  raiseInput: {
    flex: 1,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
  },
  waiting: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 17,
    padding: 20,
  },
  winner: {
    color: '#ffd60a',
    fontSize: 20,
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 20,
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
  },
}
