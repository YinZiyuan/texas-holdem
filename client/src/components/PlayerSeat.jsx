import { Card } from './CommunityCards'

export default function PlayerSeat({ player, isCurrentPlayer, isSelf }) {
  if (!player) return <div style={{ width: 120, height: 80 }} />
  return (
    <div style={{ textAlign: 'center', padding: 8, background: isCurrentPlayer ? '#2f4a1a' : '#1a2a0a', borderRadius: 12, border: `2px solid ${isCurrentPlayer ? '#69db7c' : '#2f4010'}`, minWidth: 100 }}>
      <div style={{ color: isSelf ? '#ffd43b' : '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
        {player.name} {isSelf ? '(你)' : ''}
      </div>
      <div style={{ color: '#69db7c', fontSize: 12, marginBottom: 6 }}>
        💰 {player.chips} {player.bet > 0 && <span style={{ color: '#f59f00' }}>+{player.bet}</span>}
      </div>
      {player.folded && <div style={{ color: '#868e96', fontSize: 11 }}>弃牌</div>}
      {player.holeCards && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {player.holeCards.map((c, i) => <Card key={i} card={c} />)}
        </div>
      )}
    </div>
  )
}
