import { Room } from './room.js'

export class RoomManager {
  constructor() {
    this.rooms = new Map()
  }

  createRoom(options) {
    const code = this._generateCode()
    const room = new Room(code, options)
    // Host socket ID will be set in socket-handler after room creation
    room.addPlayer({ id: options.hostId || 'host', name: options.hostName })
    this.rooms.set(code, room)
    return room
  }

  joinRoom(code, socketPlayer) {
    const room = this.getRoom(code)
    if (!room) throw new Error('Room not found')
    return room.addPlayer(socketPlayer)
  }

  removePlayer(code, socketId) {
    const room = this.getRoom(code)
    if (room) room.removePlayer(socketId)
  }

  getRoom(code) {
    return this.rooms.get(code) ?? null
  }

  getRoomList() {
    const list = []
    for (const [code, room] of this.rooms) {
      // Only show lobby rooms that aren't full
      if (room.status === 'lobby' && room.players.length < room.options.maxPlayers) {
        list.push({
          code: room.code,
          name: room.name,
          players: room.players.length,
          maxPlayers: room.options.maxPlayers,
          startingChips: room.options.startingChips,
          bigBlind: room.options.bigBlind
        })
      }
    }
    // Sort by created time, newest first
    return list.sort((a, b) => b.createdAt - a.createdAt)
  }

  _generateCode() {
    // Omit ambiguous chars I, O, 1, 0
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code
    do {
      code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    } while (this.rooms.has(code))
    return code
  }
}
