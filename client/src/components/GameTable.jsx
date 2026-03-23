import CommunityCards from './CommunityCards'
import PlayerSeat from './PlayerSeat'
import ActionPanel from './ActionPanel'

export default function GameTable({ socket, roomCode, gameState, onLeave }) {
  if (!gameState) return (
    <div style={styles.loading}>
      <div style={styles.spinner}></div>
      <div style={styles.loadingText}>连接中...</div>
    </div>
  )

  const myId = socket.id
  const { game, players, status } = gameState

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.roomCode}>{roomCode}</div>
        <div style={styles.phase}>
          {status === 'lobby' ? `等待中 (${players?.length || 0}人)` : (game?.phase || '')}
        </div>
        <button style={styles.leaveBtn} onClick={onLeave}>退出</button>
      </div>

      {/* Lobby State */}
      {status === 'lobby' && (
        <div style={styles.lobby}>
          <div style={styles.playerList}>
            {players?.map(p => (
              <div key={p.id} style={styles.lobbyPlayer}>
                <div style={styles.lobbyAvatar}>{p.name.charAt(0)}</div>
                <div style={styles.lobbyName}>{p.name}</div>
              </div>
            ))}
          </div>
          {players?.length >= 2 && (
            <button
              style={styles.startBtn}
              onClick={() => socket.emit('game:start', { code: roomCode })}
            >
              开始游戏
            </button>
          )}
        </div>
      )}

      {/* Playing State */}
      {status === 'playing' && game && (
        <>
          {/* Opponents */}
          <div style={styles.opponents}>
            {game.players.filter(p => p.id !== myId).map(p => (
              <PlayerSeat
                key={p.id}
                player={p}
                isCurrentPlayer={p.id === game.currentPlayerId}
                isSelf={false}
              />
            ))}
          </div>

          {/* Table */}
          <div style={styles.table}>
            <div style={styles.pot}>底池 {game.pot.toLocaleString()}</div>
            <CommunityCards cards={game.communityCards} />
            <div style={styles.currentBet}>当前注 {game.currentBet}</div>
          </div>

          {/* Self */}
          <div style={styles.selfArea}>
            <PlayerSeat
              player={game.players.find(p => p.id === myId)}
              isCurrentPlayer={game.currentPlayerId === myId}
              isSelf={true}
            />
          </div>

          {/* Actions */}
          <ActionPanel
            socket={socket}
            roomCode={roomCode}
            gameState={gameState}
            myId={myId}
          />
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0d3a2a 0%, #0a2a1a 50%, #061a0f 100%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  roomCode: {
    background: 'rgba(255,255,255,0.1)',
    padding: '8px 16px',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: 'SF Mono, Monaco, monospace',
    letterSpacing: 2,
  },
  phase: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: 500,
  },
  leaveBtn: {
    padding: '8px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    cursor: 'pointer',
  },
  lobby: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  playerList: {
    display: 'flex',
    gap: 20,
    marginBottom: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  lobbyPlayer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  lobbyAvatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 24,
    fontWeight: 600,
  },
  lobbyName: {
    color: '#fff',
    fontSize: 14,
  },
  startBtn: {
    padding: '18px 48px',
    borderRadius: 16,
    border: 'none',
    background: '#30d158',
    color: '#000',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(48,209,88,0.4)',
  },
  opponents: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    padding: '20px',
    flexWrap: 'wrap',
  },
  table: {
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 80,
    padding: '24px 40px',
    margin: '0 auto',
    maxWidth: 520,
    textAlign: 'center',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  pot: {
    color: '#ffd60a',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
  },
  currentBet: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 12,
  },
  selfArea: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  },
  loading: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#0a84ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
}
