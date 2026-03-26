import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { RoomManager } from './room/room-manager.js'
import { registerSocketHandlers } from './socket/socket-handler.js'

const app = express()

// CORS 配置 - 允许 Vercel、本地开发和阿里云服务器
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://texas-holdem.vercel.app',
  'https://*.vercel.app',
  'http://8.130.110.21',
  'http://8.130.110.21:80',
  'http://8.130.110.21:3001'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => {
      if (o.includes('*')) {
        const pattern = o.replace('*', '.*')
        return new RegExp(pattern).test(origin)
      }
      return o === origin
    })) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })
const roomManager = new RoomManager()

registerSocketHandlers(io, roomManager)

app.get('/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`))
