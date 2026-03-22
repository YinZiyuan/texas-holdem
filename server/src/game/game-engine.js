import { createDeck, shuffle } from './deck.js'
import { getBestHand, compareHands } from './hand-evaluator.js'

export class GameEngine {
  constructor(players, options = {}) {
    this.options = { smallBlind: 10, bigBlind: 20, ...options }
    this.state = {
      phase: 'waiting',
      players: players.map(p => ({ ...p, holeCards: [], bet: 0, folded: false, allIn: false })),
      communityCards: [],
      pot: 0,
      currentBet: 0,
      dealerIndex: 0,
      currentPlayerIndex: 0,
      deck: [],
      // Track which players have acted this street (needed for BB option)
      actedThisStreet: new Set()
    }
  }

  start() {
    const s = this.state
    s.deck = shuffle(createDeck())
    s.communityCards = []
    s.pot = 0
    s.currentBet = 0
    s.phase = 'preflop'
    s.winner = undefined
    s.actedThisStreet = new Set()
    s.players.forEach(p => { p.holeCards = []; p.bet = 0; p.folded = false; p.allIn = false })

    // Deal 2 hole cards each
    s.players.forEach(p => { p.holeCards = [s.deck.pop(), s.deck.pop()] })

    // Post blinds
    const n = s.players.length
    let sbIdx, bbIdx
    if (n === 2) {
      // Heads-up: dealer is SB, other player is BB
      sbIdx = s.dealerIndex
      bbIdx = (s.dealerIndex + 1) % n
    } else {
      sbIdx = (s.dealerIndex + 1) % n
      bbIdx = (s.dealerIndex + 2) % n
    }
    this._postBlind(sbIdx, this.options.smallBlind)
    this._postBlind(bbIdx, this.options.bigBlind)
    s.currentBet = this.options.bigBlind

    // BB has "acted" by posting — mark them so UTG must act before BB gets option
    // Actually: BB gets to act last preflop (BB option), so we do NOT mark BB as acted
    // UTG (first to act preflop)
    if (n === 2) {
      // Heads-up: dealer/SB acts first preflop
      s.currentPlayerIndex = sbIdx
    } else {
      s.currentPlayerIndex = (bbIdx + 1) % n
    }
  }

  _postBlind(idx, amount) {
    const s = this.state
    const p = s.players[idx]
    const posted = Math.min(amount, p.chips)
    p.chips -= posted
    p.bet += posted
    s.pot += posted
    if (p.chips === 0) p.allIn = true
  }

  playerAction(playerId, action, amount = 0) {
    const s = this.state
    const player = s.players.find(p => p.id === playerId)
    if (!player || player.folded || player.allIn) return
    if (s.players[s.currentPlayerIndex].id !== playerId) return

    if (action === 'fold') {
      player.folded = true
    } else if (action === 'call') {
      const toCall = Math.min(s.currentBet - player.bet, player.chips)
      player.chips -= toCall
      player.bet += toCall
      s.pot += toCall
      if (player.chips === 0) player.allIn = true
    } else if (action === 'check') {
      // valid only when player.bet === currentBet — no chips change
    } else if (action === 'raise') {
      const toCall = s.currentBet - player.bet
      const raiseAmount = Math.min(toCall + amount, player.chips)
      player.chips -= raiseAmount
      player.bet += raiseAmount
      s.pot += raiseAmount
      s.currentBet = player.bet
      if (player.chips === 0) player.allIn = true
      // On raise, reset acted set — everyone needs to act again
      s.actedThisStreet = new Set()
    }

    s.actedThisStreet.add(playerId)

    if (this._isRoundOver()) {
      this._advancePhase()
    } else {
      this._nextPlayer()
    }
  }

  _activePlayers() {
    return this.state.players.filter(p => !p.folded)
  }

  _isRoundOver() {
    const s = this.state
    const active = this._activePlayers().filter(p => !p.allIn)
    if (active.length === 0) return true
    if (active.length === 1 && this._activePlayers().length === 1) return true
    // All active (non-all-in) players must have acted AND bets must be equal
    const allActed = active.every(p => s.actedThisStreet.has(p.id))
    const betsEqual = active.every(p => p.bet === s.currentBet)
    return allActed && betsEqual
  }

  _nextPlayer() {
    const s = this.state
    let idx = (s.currentPlayerIndex + 1) % s.players.length
    while (s.players[idx].folded || s.players[idx].allIn) {
      idx = (idx + 1) % s.players.length
      if (idx === s.currentPlayerIndex) break
    }
    s.currentPlayerIndex = idx
  }

  _advancePhase() {
    const s = this.state
    const active = this._activePlayers()

    // Reset bets and acted set for next street
    s.players.forEach(p => { p.bet = 0 })
    s.currentBet = 0
    s.actedThisStreet = new Set()

    // Only one player left — they win
    if (active.length === 1) {
      active[0].chips += s.pot
      s.pot = 0
      s.phase = 'ended'
      s.winner = active[0].id
      return
    }

    if (s.phase === 'preflop') {
      s.phase = 'flop'
      s.deck.pop() // burn
      s.communityCards = [s.deck.pop(), s.deck.pop(), s.deck.pop()]
    } else if (s.phase === 'flop') {
      s.phase = 'turn'
      s.deck.pop() // burn
      s.communityCards.push(s.deck.pop())
    } else if (s.phase === 'turn') {
      s.phase = 'river'
      s.deck.pop() // burn
      s.communityCards.push(s.deck.pop())
    } else if (s.phase === 'river') {
      s.phase = 'showdown'
      this._resolveShowdown()
      return
    }

    // First to act post-flop: first active player after dealer
    const n = s.players.length
    let idx = (s.dealerIndex + 1) % n
    while (s.players[idx].folded || s.players[idx].allIn) idx = (idx + 1) % n
    s.currentPlayerIndex = idx
  }

  _resolveShowdown() {
    const s = this.state
    const active = this._activePlayers()
    const evaluated = active.map(p => ({
      player: p,
      hand: getBestHand(p.holeCards, s.communityCards)
    }))
    evaluated.sort((a, b) => compareHands(b.hand, a.hand))
    // Simple winner-takes-all (no split pot in v1)
    evaluated[0].player.chips += s.pot
    s.pot = 0
    s.phase = 'ended'
    s.winner = evaluated[0].player.id
  }

  nextHand() {
    const s = this.state
    s.dealerIndex = (s.dealerIndex + 1) % s.players.length
    this.start()
  }

  getPublicState(forPlayerId) {
    const s = this.state
    return {
      phase: s.phase,
      communityCards: s.communityCards,
      pot: s.pot,
      currentBet: s.currentBet,
      currentPlayerId: s.players[s.currentPlayerIndex]?.id,
      winner: s.winner,
      bigBlind: this.options.bigBlind,
      players: s.players.map(p => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        bet: p.bet,
        folded: p.folded,
        allIn: p.allIn,
        // Only reveal hole cards to owner; at showdown reveal all active players' cards
        holeCards: p.id === forPlayerId
          ? p.holeCards
          : (s.phase === 'showdown' || s.phase === 'ended') && !p.folded
            ? p.holeCards
            : p.holeCards.map(() => ({ id: 'hidden' }))
      }))
    }
  }
}
