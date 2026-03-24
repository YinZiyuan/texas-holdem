import { Card } from './CommunityCards'

// 状态颜色映射
const STATUS_COLORS = {
  online: '#30d158',  // 绿色
  offline: '#ff453a', // 红色
  away: '#ff9500',    // 橙色
}

export default function PlayerSeat({ player, isCurrentPlayer, isSelf }) {
  if (!player) return <div style={{ width: 100 }} />

  const status = player.status || 'online'
  const statusColor = STATUS_COLORS[status]
  const avatar = player.avatar || { initial: player.name.charAt(0).toUpperCase(), bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }

  // 格式化统计信息
  const stats = player.stats
  const winRate = stats?.winRate || 0

  return (
    <div style={{
      ...styles.container,
      ...(isSelf ? styles.self : {}),
      ...(isCurrentPlayer ? styles.active : {}),
    }}>
      {/* 头像和状态 */}
      <div style={styles.avatarWrapper}>
        <div style={{
          ...styles.avatar,
          background: avatar.bgGradient,
        }}>
          {avatar.initial}
        </div>
        {/* 状态指示器 */}
        <div style={{
          ...styles.statusDot,
          background: statusColor,
          ...(status === 'away' ? styles.pulse : {}),
        }} />
      </div>

      {/* 名字 */}
      <div style={styles.name}>
        {player.name} {isSelf && <span style={styles.selfBadge}>你</span>}
      </div>

      {/* 筹码 */}
      <div style={styles.chips}>
        {player.chips.toLocaleString()}
        {player.bet > 0 && <span style={styles.bet}>+{player.bet}</span>}
      </div>

      {/* 统计信息 */}
      {stats && (
        <div style={styles.stats}>
          🏆 {winRate}% <span style={styles.statsDetail}>({stats.handsWon || 0}/{stats.handsPlayed || 0})</span>
        </div>
      )}

      {/* 游戏状态 */}
      {player.folded && <div style={styles.status}>弃牌</div>}
      {player.allIn && <div style={styles.allIn}>全押</div>}

      {/* 手牌 */}
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
    padding: '12px 14px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    minWidth: 100,
    transition: 'all 0.3s ease',
  },
  self: {
    background: 'rgba(10,132,255,0.15)',
    border: '1px solid rgba(10,132,255,0.3)',
  },
  active: {
    boxShadow: '0 0 0 2px #30d158, 0 0 20px rgba(48,209,88,0.3)',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '2px solid #1c1c1e',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  pulse: {
    animation: 'pulse 2s ease-in-out infinite',
  },
  name: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 4,
    maxWidth: 90,
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
  stats: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
    fontWeight: 500,
  },
  statsDetail: {
    fontSize: 10,
    opacity: 0.7,
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
