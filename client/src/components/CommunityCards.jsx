const SUIT_SYMBOL = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }
const SUIT_COLOR = { spades: '#000', hearts: '#ff453a', diamonds: '#ff453a', clubs: '#000' }

export function Card({ card, hidden }) {
  if (!card || card.id === 'hidden' || hidden) {
    return (
      <div style={styles.cardBack}>
        <div style={styles.cardPattern}>♠</div>
      </div>
    )
  }
  return (
    <div style={styles.card}>
      <div style={{...styles.rank, color: SUIT_COLOR[card.suit]}}>{card.rank}</div>
      <div style={{...styles.suit, color: SUIT_COLOR[card.suit]}}>{SUIT_SYMBOL[card.suit]}</div>
    </div>
  )
}

export default function CommunityCards({ cards = [] }) {
  const slots = Array.from({ length: 5 }, (_, i) => cards[i] || null)
  return (
    <div style={styles.container}>
      {slots.map((card, i) => (
        <Card key={i} card={card} hidden={!card} />
      ))}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    padding: '12px 20px',
  },
  card: {
    width: 56,
    height: 80,
    background: '#fff',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
    border: '1px solid rgba(0,0,0,0.08)',
  },
  cardBack: {
    width: 56,
    height: 80,
    background: 'linear-gradient(135deg, #1a5f9e 0%, #0d3a5c 100%)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  cardPattern: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.2)',
  },
  rank: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1,
  },
  suit: {
    fontSize: 24,
    lineHeight: 1,
    marginTop: 2,
  },
}
