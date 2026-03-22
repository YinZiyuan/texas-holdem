const SUIT_SYMBOL = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }
const SUIT_COLOR = { spades: '#fff', hearts: '#ff6b6b', diamonds: '#ff6b6b', clubs: '#fff' }

export function Card({ card, hidden }) {
  if (!card || card.id === 'hidden' || hidden) {
    return (
      <div style={{ width: 44, height: 64, background: '#1a3a8a', borderRadius: 6, border: '1px solid #3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#3b5bdb' }}>
        🂠
      </div>
    )
  }
  return (
    <div style={{ width: 44, height: 64, background: '#fff', borderRadius: 6, border: '1px solid #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: SUIT_COLOR[card.suit], fontSize: 14, fontWeight: 'bold' }}>
      <div>{card.rank}</div>
      <div style={{ fontSize: 18 }}>{SUIT_SYMBOL[card.suit]}</div>
    </div>
  )
}

export default function CommunityCards({ cards = [] }) {
  const slots = Array.from({ length: 5 }, (_, i) => cards[i] || null)
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
      {slots.map((card, i) => <Card key={i} card={card} hidden={!card} />)}
    </div>
  )
}
