import { describe, it, expect } from 'vitest'
import { GameEngine } from '../../src/game/game-engine.js'

function makePlayers(n = 3) {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Player${i}`, chips: 1000 }))
}

describe('GameEngine', () => {
  it('starts in waiting state', () => {
    const game = new GameEngine(makePlayers(), { smallBlind: 10, bigBlind: 20 })
    expect(game.state.phase).toBe('waiting')
  })

  it('transitions to preflop after start', () => {
    const game = new GameEngine(makePlayers(), { smallBlind: 10, bigBlind: 20 })
    game.start()
    expect(game.state.phase).toBe('preflop')
  })

  it('deals 2 hole cards to each player', () => {
    const game = new GameEngine(makePlayers(3), { smallBlind: 10, bigBlind: 20 })
    game.start()
    game.state.players.forEach(p => {
      expect(p.holeCards).toHaveLength(2)
    })
  })

  it('posts small and big blinds', () => {
    const players = makePlayers(3)
    const game = new GameEngine(players, { smallBlind: 10, bigBlind: 20 })
    game.start()
    const sbPlayer = game.state.players[game.state.dealerIndex + 1 < game.state.players.length ? game.state.dealerIndex + 1 : 0]
    const bbPlayer = game.state.players[game.state.dealerIndex + 2 < game.state.players.length ? game.state.dealerIndex + 2 : 1]
    expect(sbPlayer.bet).toBe(10)
    expect(bbPlayer.bet).toBe(20)
  })

  it('fold removes player from active players', () => {
    const game = new GameEngine(makePlayers(3), { smallBlind: 10, bigBlind: 20 })
    game.start()
    const activeId = game.state.players[game.state.currentPlayerIndex].id
    game.playerAction(activeId, 'fold')
    const player = game.state.players.find(p => p.id === activeId)
    expect(player.folded).toBe(true)
  })

  it('call matches current bet', () => {
    const game = new GameEngine(makePlayers(3), { smallBlind: 10, bigBlind: 20 })
    game.start()
    const actingPlayer = game.state.players[game.state.currentPlayerIndex]
    const before = actingPlayer.chips
    game.playerAction(actingPlayer.id, 'call')
    expect(actingPlayer.chips).toBeLessThan(before)
    expect(actingPlayer.bet).toBe(game.state.currentBet)
  })

  it('advances to flop after preflop betting', () => {
    const game = new GameEngine(makePlayers(2), { smallBlind: 10, bigBlind: 20 })
    game.start()
    // p0 is dealer/SB, p1 is BB; p0 acts first preflop → call
    const acting = game.state.players[game.state.currentPlayerIndex]
    game.playerAction(acting.id, 'call')
    // BB checks
    const next = game.state.players[game.state.currentPlayerIndex]
    game.playerAction(next.id, 'check')
    expect(game.state.phase).toBe('flop')
    expect(game.state.communityCards).toHaveLength(3)
  })

  it('winner gets pot when others fold', () => {
    const game = new GameEngine(makePlayers(2), { smallBlind: 10, bigBlind: 20 })
    game.start()
    const loser = game.state.players[game.state.currentPlayerIndex]
    const winner = game.state.players.find(p => p.id !== loser.id)
    const winnerChipsBefore = winner.chips
    game.playerAction(loser.id, 'fold')
    expect(winner.chips).toBeGreaterThan(winnerChipsBefore)
  })
})
