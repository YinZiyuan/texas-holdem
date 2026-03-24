import { createDeck, shuffle } from './deck.js'
import { getBestHand, compareHands } from './hand-evaluator.js'
import { PotManager } from './pot-manager.js'
import { Timer } from './timer.js'

export class GameEngine {
  constructor(players, options = {}) {
    this.options = {
      smallBlind: 10,
      bigBlind: 20,
      turnTime: 20000, // 每手思考时间（毫秒）
      ...options
    }
    this.state = {
      phase: 'waiting',
      players: players.map(p => ({ ...p, holeCards: [], bet: 0, folded: false, allIn: false })),
      communityCards: [],
      potManager: new PotManager(),
      currentBet: 0,
      lastRaiseAmount: 0,
      dealerIndex: 0,
      currentPlayerIndex: 0,
      deck: [],
      actedThisStreet: new Set(),
      streetBets: {},
      timer: new Timer(this.options.turnTime),
      remainingTime: 0,
      currentPlayerId: null
    }
  }

  start() {
    const s = this.state
    s.deck = shuffle(createDeck())
    s.communityCards = []
    s.potManager.reset()
    s.currentBet = 0
    s.phase = 'preflop'
    s.winner = undefined
    s.actedThisStreet = new Set()
    s.streetBets = {}
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
    s.lastRaiseAmount = this.options.bigBlind // BB is the initial "raise" from SB

    // UTG (first to act preflop)
    if (n === 2) {
      // Heads-up: dealer/SB acts first preflop
      s.currentPlayerIndex = sbIdx
    } else {
      s.currentPlayerIndex = (bbIdx + 1) % n
    }

    // 启动第一个玩家的倒计时
    this._startTimerForCurrentPlayer()
  }

  _postBlind(idx, amount) {
    const s = this.state
    const p = s.players[idx]
    const posted = Math.min(amount, p.chips)
    p.chips -= posted
    p.bet += posted
    s.streetBets[p.id] = (s.streetBets[p.id] || 0) + posted
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
      s.streetBets[playerId] = (s.streetBets[playerId] || 0) + toCall
      if (player.chips === 0) player.allIn = true
    } else if (action === 'check') {
      if (player.bet !== s.currentBet) return // invalid: can't check with a bet deficit
    } else if (action === 'raise') {
      const toCall = s.currentBet - player.bet
      // Minimum raise = last raise amount (standard no-limit rule)
      const minRaiseTotal = s.currentBet + s.lastRaiseAmount
      const newBet = Math.min(toCall + amount, player.chips)
      // Validate: new bet must be at least minRaiseTotal (unless all-in)
      if (newBet < minRaiseTotal && newBet < toCall + player.chips) {
        return // Invalid raise - not enough
      }
      const actualRaiseAmount = newBet - s.currentBet
      player.chips -= newBet
      player.bet += newBet
      s.streetBets[playerId] = (s.streetBets[playerId] || 0) + newBet
      s.currentBet = player.bet
      s.lastRaiseAmount = actualRaiseAmount > 0 ? actualRaiseAmount : s.lastRaiseAmount
      if (player.chips === 0) player.allIn = true
      // On raise, reset acted set — everyone needs to act again
      s.actedThisStreet = new Set()
    } else {
      return // unknown action — ignore
    }

    s.actedThisStreet.add(playerId)

    // 停止当前计时器
    s.timer.stop()

    if (this._isRoundOver()) {
      this._advancePhase()
    } else {
      this._nextPlayer()
      // 为新玩家启动计时器
      this._startTimerForCurrentPlayer()
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

  _startTimerForCurrentPlayer() {
    const s = this.state
    const player = s.players[s.currentPlayerIndex]
    if (!player || player.folded || player.allIn) return

    s.currentPlayerId = player.id

    s.timer.start(
      this.options.turnTime,
      () => {
        // 超时回调 - 自动 Fold
        this._onTimeout(player.id)
      },
      (remaining) => {
        // 每秒回调 - 更新剩余时间
        s.remainingTime = remaining
      }
    )

    // 立即更新一次
    s.remainingTime = this.options.turnTime
  }

  _onTimeout(playerId) {
    const s = this.state
    const player = s.players.find(p => p.id === playerId)
    if (!player || player.folded || player.allIn) return

    console.log(`Player ${player.name} timed out, auto-folding`)

    // 执行 Fold
    player.folded = true
    s.actedThisStreet.add(playerId)

    if (this._isRoundOver()) {
      this._advancePhase()
    } else {
      this._nextPlayer()
      this._startTimerForCurrentPlayer()
    }
  }

  _advancePhase() {
    const s = this.state
    const active = this._activePlayers()

    // Create side pots at the end of each street
    const allInPlayers = new Set(s.players.filter(p => p.allIn && !p.folded).map(p => p.id))
    const foldedPlayers = new Set(s.players.filter(p => p.folded).map(p => p.id))
    s.potManager.createSidePots(s.streetBets, allInPlayers, foldedPlayers, new Set())

    // Reset bets and acted set for next street
    s.players.forEach(p => { p.bet = 0 })
    s.currentBet = 0
    s.lastRaiseAmount = this.options.bigBlind
    s.actedThisStreet = new Set()
    s.streetBets = {}

    // Only one player left — they win all pots
    if (active.length === 1) {
      const totalPot = s.potManager.getTotalPot()
      active[0].chips += totalPot
      s.potManager.reset()
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

    // 启动新阶段的倒计时
    this._startTimerForCurrentPlayer()
  }

  _resolveShowdown() {
    const s = this.state
    const active = this._activePlayers()

    // Create final side pots if any pending bets
    const allInPlayers = new Set(s.players.filter(p => p.allIn && !p.folded).map(p => p.id))
    const foldedPlayers = new Set(s.players.filter(p => p.folded).map(p => p.id))
    s.potManager.createSidePots(s.streetBets, allInPlayers, foldedPlayers, new Set())

    // Evaluate all active players' hands
    const playerResults = active.map(p => ({
      playerId: p.id,
      player: p,
      hand: getBestHand(p.holeCards, s.communityCards)
    }))

    // Distribute all pots
    const distributions = s.potManager.distributePots(playerResults, compareHands)

    // Apply winnings
    const winnerInfo = {}
    distributions.forEach(({ playerId, amount, potAmount, isSplit }) => {
      const p = s.players.find(pl => pl.id === playerId)
      if (p) {
        p.chips += amount
        if (!winnerInfo[playerId]) {
          winnerInfo[playerId] = { name: p.name, amount: 0, isSplit: false }
        }
        winnerInfo[playerId].amount += amount
        winnerInfo[playerId].isSplit = winnerInfo[playerId].isSplit || isSplit
      }
    })

    s.potManager.reset()
    s.phase = 'ended'

    // Set primary winner (for simple display)
    const winners = Object.entries(winnerInfo)
    if (winners.length === 1) {
      s.winner = winners[0][0]
    } else {
      s.winner = Object.keys(winnerInfo) // Multiple winners
    }
  }

  nextHand() {
    const s = this.state
    s.dealerIndex = (s.dealerIndex + 1) % s.players.length
    this.start()
  }

  getPublicState(forPlayerId) {
    const s = this.state
    const pots = s.potManager.getPots()
    return {
      phase: s.phase,
      communityCards: s.communityCards,
      pot: s.potManager.getTotalPot(),
      pots: pots, // Array of { amount, eligiblePlayers }
      currentBet: s.currentBet,
      lastRaiseAmount: s.lastRaiseAmount,
      currentPlayerId: s.players[s.currentPlayerIndex]?.id,
      remainingTime: s.remainingTime, // 剩余时间（毫秒）
      totalTime: this.options.turnTime, // 总时长
      winner: s.winner,
      bigBlind: this.options.bigBlind,
      players: s.players.map(p => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        bet: p.bet,
        folded: p.folded,
        allIn: p.allIn,
        eligiblePot: pots.filter(pt => pt.eligiblePlayers.includes(p.id)).reduce((sum, pt) => sum + pt.amount, 0),
        holeCards: p.id === forPlayerId
          ? p.holeCards
          : (s.phase === 'showdown' || s.phase === 'ended') && !p.folded
            ? p.holeCards
            : p.holeCards.map(() => ({ id: 'hidden' }))
      }))
    }
  }
}
