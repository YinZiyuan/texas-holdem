import CommunityCards from './CommunityCards'
import PlayerSeat from './PlayerSeat'
import ActionPanel from './ActionPanel'

export default function GameTable({ socket, roomCode, gameState }) {
  if (!gameState) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>连接中...</div>

  const myId = socket.id
  const { game, players, status } = gameState

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', marginBottom: 16 }}>
        <span style={{ background: '#1a3a2a', padding: '4px 12px', borderRadius: 8, fontFamily: 'monospace', fontSize: 18, letterSpacing: 4 }}>
          {roomCode}
        </span>
        <span style={{ color: '#69db7c' }}>
          {status === 'lobby' ? `大厅 (${players?.length || 0}人)` : `${game?.phase || ''}`}
        </span>
      </div>

      {/* Start Game Button */}
      {status === 'lobby' && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ color: '#aaa', marginBottom: 16 }}>
            {players?.map(p => <div key={p.id} style={{ color: '#fff', marginBottom: 4 }}>👤 {p.name}</div>)}
          </div>
          <button onClick={() => socket.emit('game:start', { code: roomCode })}
            style={{ padding: '12px 32px', background: '#2f9e44', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, cursor: 'pointer', fontWeight: 'bold' }}>
            开始游戏
          </button>
        </div>
      )}

      {/* Game Area */}
      {status === 'playing' && game && (
        <>
          {/* Player seats (top row) */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            {game.players.filter(p => p.id !== myId).map(p => (
              <PlayerSeat key={p.id} player={p} isCurrentPlayer={p.id === game.currentPlayerId} isSelf={false} />
            ))}
          </div>

          {/* Table center */}
          <div style={{ background: '#0a5c2a', borderRadius: 80, padding: '20px 40px', margin: '0 auto', maxWidth: 500, textAlign: 'center' }}>
            <div style={{ color: '#ffd43b', fontSize: 14, marginBottom: 4 }}>底池: {game.pot}</div>
            <CommunityCards cards={game.communityCards} />
            <div style={{ color: '#aaa', fontSize: 12 }}>当前注: {game.currentBet}</div>
          </div>

          {/* Self seat */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <PlayerSeat
              player={game.players.find(p => p.id === myId)}
              isCurrentPlayer={game.currentPlayerId === myId}
              isSelf={true}
            />
          </div>

          {/* Action Panel */}
          <ActionPanel socket={socket} roomCode={roomCode} gameState={gameState} myId={myId} />
        </>
      )}
    </div>
  )
}
