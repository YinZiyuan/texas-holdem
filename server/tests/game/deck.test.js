import { describe, it, expect } from 'vitest'
import { createDeck, shuffle } from '../../src/game/deck.js'

describe('createDeck', () => {
  it('creates 52 unique cards', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(52)
    const ids = new Set(deck.map(c => c.id))
    expect(ids.size).toBe(52)
  })

  it('each card has suit, rank, and id', () => {
    const deck = createDeck()
    const card = deck[0]
    expect(card).toHaveProperty('suit')
    expect(card).toHaveProperty('rank')
    expect(card).toHaveProperty('id')
    expect(card).toHaveProperty('value')
    expect(typeof card.value).toBe('number')
  })

  it('has 4 suits × 13 ranks', () => {
    const deck = createDeck()
    const suits = new Set(deck.map(c => c.suit))
    const ranks = new Set(deck.map(c => c.rank))
    expect(suits.size).toBe(4)
    expect(ranks.size).toBe(13)
  })
})

describe('shuffle', () => {
  it('returns same 52 cards in different order', () => {
    const deck = createDeck()
    const shuffled = shuffle([...deck])
    expect(shuffled).toHaveLength(52)
    const ids = new Set(shuffled.map(c => c.id))
    expect(ids.size).toBe(52)
    // extremely unlikely to be same order
    expect(shuffled).not.toEqual(deck)
  })

  it('does not mutate original', () => {
    const deck = createDeck()
    const original = [...deck]
    shuffle(deck)
    expect(deck).toEqual(original)
  })
})
