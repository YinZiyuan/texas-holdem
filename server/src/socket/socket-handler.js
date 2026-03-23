export function registerSocketHandlers(io, roomManager) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('room:create', (options, cb) => {
      try {
        const room = roomManager.createRoom({ ...options, hostName: options.playerName })
        // Re-add with real socket ID
        room.players[0].socketId = socket.id
        room.players[0].id = socket.id
        socket.join(room.code)
        cb({ ok: true, code: room.code, state: room.getPublicState(socket.id) })
      } catch (e) {
        cb({ ok: false, error: e.message })
      }
    })

    socket.on('room:join', ({ code, playerName }, cb) => {
      try {
        const room = roomManager.getRoom(code)
        if (!room) return cb({ ok: false, error: 'Room not found' })
        // Check if reconnecting (same name already in room)
        const existing = room.players.find(p => p.name === playerName)
        if (existing) {
          const oldId = existing.id
          // Update socket ID for reconnect
          existing.socketId = socket.id
          existing.id = socket.id
          // Also update game engine's player list if game started
          if (room.game && room.game.state) {
            const gamePlayer = room.game.state.players.find(p => p.id === oldId)
            if (gamePlayer) {
              gamePlayer.id = socket.id
              gamePlayer.socketId = socket.id
            }
          }
        } else {
          roomManager.joinRoom(code, { id: socket.id, name: playerName })
        }
        socket.join(code)
        io.to(code).emit('room:updated', room.getPublicState(null))
        cb({ ok: true, state: room.getPublicState(socket.id) })
      } catch (e) {
        cb({ ok: false, error: e.message })
      }
    })

    socket.on('game:start', ({ code }, cb) => {
      try {
        const room = roomManager.getRoom(code)
        if (!room) return cb({ ok: false, error: 'Room not found' })
        room.startGame()
        // Send each player their private state
        room.players.forEach(p => {
          io.to(p.socketId).emit('game:state', room.getPublicState(p.socketId))
        })
        cb({ ok: true })
      } catch (e) {
        console.error('game:start error:', e.message)
        if (cb) cb({ ok: false, error: e.message })
      }
    })

    socket.on('game:action', ({ code, action, amount }, cb) => {
      try {
        const room = roomManager.getRoom(code)
        if (!room || !room.game) return cb({ ok: false, error: 'Game not found' })
        room.game.playerAction(socket.id, action, amount || 0)
        // Broadcast updated private state to each player
        room.players.forEach(p => {
          io.to(p.socketId).emit('game:state', room.getPublicState(p.socketId))
        })
        if (cb) cb({ ok: true })
      } catch (e) {
        console.error('game:action error:', e.message)
        if (cb) cb({ ok: false, error: e.message })
      }
    })

    socket.on('game:next-hand', ({ code }) => {
      const room = roomManager.getRoom(code)
      if (!room || !room.game) return
      room.game.nextHand()
      room.players.forEach(p => {
        io.to(p.socketId).emit('game:state', room.getPublicState(p.socketId))
      })
    })

    socket.on('disconnect', () => {
      // Remove from any room they were in
      // (simple: iterate all rooms — ok for small scale)
      for (const [code, room] of roomManager.rooms) {
        const was = room.players.find(p => p.socketId === socket.id)
        if (was) {
          roomManager.removePlayer(code, socket.id)
          io.to(code).emit('room:updated', room.getPublicState(null))
          break
        }
      }
    })
  })
}
