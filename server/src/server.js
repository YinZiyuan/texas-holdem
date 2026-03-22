import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { RoomManager } from './room/room-manager.js'
import { registerSocketHandlers } from './socket/socket-handler.js'

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })
const roomManager = new RoomManager()

registerSocketHandlers(io, roomManager)

app.get('/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`))
