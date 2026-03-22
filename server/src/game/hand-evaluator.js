const HAND_RANKS = {
  royal_flush: 9, straight_flush: 8, four_of_a_kind: 7, full_house: 6,
  flush: 5, straight: 4, three_of_a_kind: 3, two_pair: 2, one_pair: 1, high_card: 0
}

export function evaluateHand(cards) {
  // cards: array of 5 card objects
  const values = cards.map(c => c.value).sort((a, b) => b - a)
  const suits = cards.map(c => c.suit)
  const isFlush = new Set(suits).size === 1
  const isStraight = values[0] - values[4] === 4 && new Set(values).size === 5
  // Wheel: A-2-3-4-5 (Ace plays low)
  const isWheel = JSON.stringify(values) === JSON.stringify([14, 5, 4, 3, 2])
  const counts = {}
  values.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
  const groups = Object.entries(counts).map(([v, c]) => [Number(v), c]).sort((a, b) => b[1] - a[1] || b[0] - a[0])

  let rank
  // Royal flush: suited A-K-Q-J-10 (NOT a wheel)
  if (isFlush && isStraight && values[0] === 14) rank = 'royal_flush'
  else if (isFlush && (isStraight || isWheel)) rank = 'straight_flush'
  else if (groups[0][1] === 4) rank = 'four_of_a_kind'
  else if (groups[0][1] === 3 && groups[1][1] === 2) rank = 'full_house'
  else if (isFlush) rank = 'flush'
  else if (isStraight || isWheel) rank = 'straight'
  else if (groups[0][1] === 3) rank = 'three_of_a_kind'
  else if (groups[0][1] === 2 && groups[1][1] === 2) rank = 'two_pair'
  else if (groups[0][1] === 2) rank = 'one_pair'
  else rank = 'high_card'

  // For a wheel (A-2-3-4-5), Ace plays as 1 — tiebreaker high card is 5, not 14
  const tiebreakers = isWheel
    ? [5, 4, 3, 2, 1]
    : groups.map(g => g[0])

  return { rank, score: HAND_RANKS[rank], tiebreakers }
}

function combinations(arr, k) {
  if (k === 1) return arr.map(x => [x])
  return arr.flatMap((x, i) => combinations(arr.slice(i + 1), k - 1).map(rest => [x, ...rest]))
}

export function getBestHand(holeCards, communityCards) {
  const all = [...holeCards, ...communityCards]
  if (all.length < 5) throw new Error(`getBestHand requires at least 5 cards, got ${all.length}`)
  return combinations(all, 5)
    .map(evaluateHand)
    .reduce((best, hand) => compareHands(hand, best) > 0 ? hand : best)
}

export function compareHands(a, b) {
  if (a.score !== b.score) return a.score - b.score
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
    const diff = (a.tiebreakers[i] || 0) - (b.tiebreakers[i] || 0)
    if (diff !== 0) return diff
  }
  return 0
}
