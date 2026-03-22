import { Room } from './room.js'

export class RoomManager {
  constructor() {
    this.rooms = new Map()
  }

  createRoom(options) {
    const code = this._generateCode()
    const room = new Room(code, options)
    room.addPlayer({ id: 'host', name: options.hostName })
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
