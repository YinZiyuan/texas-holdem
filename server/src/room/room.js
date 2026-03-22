import { GameEngine } from '../game/game-engine.js'

export class Room {
  constructor(code, options) {
    this.code = code
    this.options = options
    this.players = []
    this.game = null
    this.status = 'lobby' // lobby | playing | ended
  }

  addPlayer(socketPlayer) {
    if (this.players.length >= this.options.maxPlayers) throw new Error('Room is full')
    const player = {
      id: socketPlayer.id,
      name: socketPlayer.name,
      chips: this.options.startingChips,
      socketId: socketPlayer.id
    }
    this.players.push(player)
    return player
  }

  removePlayer(socketId) {
    this.players = this.players.filter(p => p.socketId !== socketId)
  }

  startGame() {
    if (this.players.length < 2) throw new Error('Need at least 2 players')
    this.game = new GameEngine(this.players, {
      smallBlind: this.options.smallBlind,
      bigBlind: this.options.bigBlind
    })
    this.game.start()
    this.status = 'playing'
  }

  getPublicState(forSocketId) {
    return {
      code: this.code,
      status: this.status,
      options: this.options,
      players: this.players.map(p => ({ id: p.socketId, name: p.name, chips: p.chips })),
      game: this.game ? this.game.getPublicState(forSocketId) : null
    }
  }
}
