import { describe, it, expect } from 'vitest'
import { RoomManager } from '../../src/room/room-manager.js'

describe('RoomManager', () => {
  it('creates a room with a 6-char code', () => {
    const rm = new RoomManager()
    const room = rm.createRoom({ hostName: 'Alice', smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 6 })
    expect(room.code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('gets room by code', () => {
    const rm = new RoomManager()
    const room = rm.createRoom({ hostName: 'Alice', smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 6 })
    expect(rm.getRoom(room.code)).toBe(room)
  })

  it('returns null for unknown code', () => {
    const rm = new RoomManager()
    expect(rm.getRoom('XXXXXX')).toBeNull()
  })

  it('allows a player to join', () => {
    const rm = new RoomManager()
    const room = rm.createRoom({ hostName: 'Alice', smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 6 })
    rm.joinRoom(room.code, { id: 's1', name: 'Bob' })
    expect(room.players).toHaveLength(2)
  })

  it('rejects join when room is full', () => {
    const rm = new RoomManager()
    const room = rm.createRoom({ hostName: 'Alice', smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 2 })
    rm.joinRoom(room.code, { id: 's2', name: 'Bob' })
    expect(() => rm.joinRoom(room.code, { id: 's3', name: 'Carol' })).toThrow('Room is full')
  })

  it('removes a player on disconnect', () => {
    const rm = new RoomManager()
    const room = rm.createRoom({ hostName: 'Alice', smallBlind: 10, bigBlind: 20, startingChips: 1000, maxPlayers: 6 })
    rm.joinRoom(room.code, { id: 's2', name: 'Bob' })
    rm.removePlayer(room.code, 's2')
    expect(room.players).toHaveLength(1)
  })
})
