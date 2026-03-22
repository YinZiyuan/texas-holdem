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

  it('has exactly the 4 standard suits and 13 ranks', () => {
    const deck = createDeck()
    const suits = new Set(deck.map(c => c.suit))
    const ranks = new Set(deck.map(c => c.rank))
    expect(suits).toEqual(new Set(['spades', 'hearts', 'diamonds', 'clubs']))
    expect(ranks).toEqual(new Set(['2','3','4','5','6','7','8','9','10','J','Q','K','A']))
  })
})

describe('shuffle', () => {
  it('returns all 52 original cards (same elements, caller array untouched)', () => {
    const deck = createDeck()
    const shuffled = shuffle(deck)  // shuffle copies internally; deck is unchanged
    expect(shuffled).toHaveLength(52)
    // same cards present (sorted by id for deterministic comparison)
    const sortById = arr => [...arr].sort((a, b) => a.id.localeCompare(b.id))
    expect(sortById(shuffled)).toEqual(sortById(deck))
  })

  it('does not mutate original', () => {
    const deck = createDeck()
    const original = [...deck]
    shuffle(deck)
    expect(deck).toEqual(original)
  })
})
