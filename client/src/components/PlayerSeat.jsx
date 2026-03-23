import { Card } from './CommunityCards'

export default function PlayerSeat({ player, isCurrentPlayer, isSelf }) {
  if (!player) return <div style={{ width: 100 }} />

  return (
    <div style={{
      ...styles.container,
      ...(isSelf ? styles.self : {}),
      ...(isCurrentPlayer ? styles.active : {}),
    }}>
      <div style={styles.avatar}>
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div style={styles.name}>
        {player.name} {isSelf && <span style={styles.selfBadge}>你</span>}
      </div>
      <div style={styles.chips}>
        {player.chips.toLocaleString()}
        {player.bet > 0 && <span style={styles.bet}>+{player.bet}</span>}
      </div>
      {player.folded && <div style={styles.status}>弃牌</div>}
      {player.allIn && <div style={styles.allIn}>全押</div>}
      {player.holeCards && (
        <div style={styles.cards}>
          {player.holeCards.map((c, i) => <Card key={i} card={c} />)}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    minWidth: 90,
    transition: 'all 0.3s ease',
  },
  self: {
    background: 'rgba(10,132,255,0.15)',
    border: '1px solid rgba(10,132,255,0.3)',
  },
  active: {
    boxShadow: '0 0 0 2px #30d158, 0 0 20px rgba(48,209,88,0.3)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
  },
  name: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 4,
    maxWidth: 80,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  selfBadge: {
    background: '#0a84ff',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 10,
    marginLeft: 4,
  },
  chips: {
    color: '#30d158',
    fontSize: 14,
    fontWeight: 600,
  },
  bet: {
    color: '#ff9f0a',
    marginLeft: 6,
    fontSize: 12,
  },
  status: {
    color: '#8e8e93',
    fontSize: 12,
    marginTop: 4,
  },
  allIn: {
    color: '#ff453a',
    fontSize: 11,
    fontWeight: 600,
    marginTop: 4,
  },
  cards: {
    display: 'flex',
    gap: 6,
    marginTop: 8,
  },
}
