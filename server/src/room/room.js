import { GameEngine } from '../game/game-engine.js'
import { generateAvatar, createInitialStats } from '../game/avatar.js'

export class Room {
  constructor(code, options) {
    this.code = code
    this.name = options.name || `房间 ${code}`
    this.hostId = options.hostId // Host socket ID
    this.options = options
    this.players = []
    this.game = null
    this.status = 'lobby' // lobby | playing | ended
    this.createdAt = Date.now()
  }

  addPlayer(socketPlayer) {
    if (this.players.length >= this.options.maxPlayers) throw new Error('Room is full')
    const player = {
      id: socketPlayer.id,
      name: socketPlayer.name,
      chips: this.options.startingChips,
      socketId: socketPlayer.id,
      // 新增字段
      avatar: generateAvatar(socketPlayer.name),
      status: 'online',
      stats: createInitialStats()
    }
    this.players.push(player)
    return player
  }

  removePlayer(socketId) {
    this.players = this.players.filter(p => p.socketId !== socketId)
  }

  setPlayerStatus(socketId, status) {
    const player = this.players.find(p => p.socketId === socketId)
    if (player) {
      player.status = status
      return true
    }
    return false
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
      name: this.name,
      status: this.status,
      options: this.options,
      hostId: this.hostId,
      players: this.players.map(p => ({
        id: p.socketId,
        name: p.name,
        chips: p.chips,
        avatar: p.avatar,
        status: p.status
      })),
      game: this.game ? this.game.getPublicState(forSocketId) : null
    }
  }
}
