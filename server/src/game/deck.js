const SUITS = ['spades', 'hearts', 'diamonds', 'clubs']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_VALUE = Object.fromEntries(RANKS.map((r, i) => [r, i + 2]))

export function createDeck() {
  return SUITS.flatMap(suit =>
    RANKS.map(rank => ({ suit, rank, id: `${rank}${suit[0].toUpperCase()}`, value: RANK_VALUE[rank] }))
  )
}

export function shuffle(deck) {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
