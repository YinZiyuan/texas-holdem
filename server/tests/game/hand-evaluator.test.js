import { describe, it, expect } from 'vitest'
import { evaluateHand, compareHands, getBestHand } from '../../src/game/hand-evaluator.js'

// Helper: make card
const c = (rank, suit) => ({ rank, suit, id: `${rank}${suit[0].toUpperCase()}`, value: ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(rank) + 2 })

describe('evaluateHand', () => {
  it('detects royal flush', () => {
    const hand = [c('A','spades'), c('K','spades'), c('Q','spades'), c('J','spades'), c('10','spades')]
    expect(evaluateHand(hand).rank).toBe('royal_flush')
  })

  it('detects straight flush', () => {
    const hand = [c('9','hearts'), c('8','hearts'), c('7','hearts'), c('6','hearts'), c('5','hearts')]
    expect(evaluateHand(hand).rank).toBe('straight_flush')
  })

  it('detects four of a kind', () => {
    const hand = [c('A','spades'), c('A','hearts'), c('A','diamonds'), c('A','clubs'), c('K','spades')]
    expect(evaluateHand(hand).rank).toBe('four_of_a_kind')
  })

  it('detects full house', () => {
    const hand = [c('A','spades'), c('A','hearts'), c('A','diamonds'), c('K','clubs'), c('K','spades')]
    expect(evaluateHand(hand).rank).toBe('full_house')
  })

  it('detects flush', () => {
    const hand = [c('A','spades'), c('9','spades'), c('7','spades'), c('4','spades'), c('2','spades')]
    expect(evaluateHand(hand).rank).toBe('flush')
  })

  it('detects straight', () => {
    const hand = [c('9','hearts'), c('8','spades'), c('7','diamonds'), c('6','clubs'), c('5','hearts')]
    expect(evaluateHand(hand).rank).toBe('straight')
  })

  it('detects three of a kind', () => {
    const hand = [c('A','spades'), c('A','hearts'), c('A','diamonds'), c('K','clubs'), c('Q','spades')]
    expect(evaluateHand(hand).rank).toBe('three_of_a_kind')
  })

  it('detects two pair', () => {
    const hand = [c('A','spades'), c('A','hearts'), c('K','diamonds'), c('K','clubs'), c('Q','spades')]
    expect(evaluateHand(hand).rank).toBe('two_pair')
  })

  it('detects one pair', () => {
    const hand = [c('A','spades'), c('A','hearts'), c('K','diamonds'), c('Q','clubs'), c('J','spades')]
    expect(evaluateHand(hand).rank).toBe('one_pair')
  })

  it('detects high card', () => {
    const hand = [c('A','spades'), c('K','hearts'), c('Q','diamonds'), c('J','clubs'), c('9','spades')]
    expect(evaluateHand(hand).rank).toBe('high_card')
  })
})

describe('getBestHand', () => {
  it('picks best 5 from 7 cards', () => {
    const holeCards = [c('A','spades'), c('K','spades')]
    const community = [c('Q','spades'), c('J','spades'), c('10','spades'), c('2','hearts'), c('3','clubs')]
    const result = getBestHand(holeCards, community)
    expect(result.rank).toBe('royal_flush')
  })

  it('throws if fewer than 5 cards provided', () => {
    expect(() => getBestHand([c('A','spades'), c('K','spades')], [c('Q','spades')])).toThrow()
  })
})

describe('compareHands', () => {
  it('royal flush beats straight flush', () => {
    const royal = evaluateHand([c('A','spades'), c('K','spades'), c('Q','spades'), c('J','spades'), c('10','spades')])
    const straight = evaluateHand([c('9','hearts'), c('8','hearts'), c('7','hearts'), c('6','hearts'), c('5','hearts')])
    expect(compareHands(royal, straight)).toBeGreaterThan(0)
  })

  it('returns 0 for equal hands', () => {
    const h1 = evaluateHand([c('A','spades'), c('K','spades'), c('Q','spades'), c('J','spades'), c('10','spades')])
    const h2 = evaluateHand([c('A','hearts'), c('K','hearts'), c('Q','hearts'), c('J','hearts'), c('10','hearts')])
    expect(compareHands(h1, h2)).toBe(0)
  })

  it('tiebreaker: ace-high flush beats king-high flush', () => {
    const aceHigh = evaluateHand([c('A','clubs'), c('10','clubs'), c('8','clubs'), c('6','clubs'), c('4','clubs')])
    const kingHigh = evaluateHand([c('K','clubs'), c('10','clubs'), c('8','clubs'), c('6','clubs'), c('4','clubs')])
    expect(compareHands(aceHigh, kingHigh)).toBeGreaterThan(0)
  })

  it('wheel straight (A-2-3-4-5) loses to 6-high straight (2-3-4-5-6)', () => {
    const wheel = evaluateHand([c('A','hearts'), c('2','spades'), c('3','diamonds'), c('4','clubs'), c('5','hearts')])
    const sixHigh = evaluateHand([c('6','hearts'), c('2','spades'), c('3','diamonds'), c('4','clubs'), c('5','hearts')])
    expect(compareHands(wheel, sixHigh)).toBeLessThan(0)
  })
})
