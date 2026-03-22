import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Lobby from './components/Lobby'
import GameTable from './components/GameTable'

const socket = io('http://localhost:3001')

export default function App() {
  const [roomCode, setRoomCode] = useState(null)
  const [gameState, setGameState] = useState(null)

  useEffect(() => {
    socket.on('connect', () => {
      // Attempt to rejoin if we had a room
      const savedCode = sessionStorage.getItem('roomCode')
      const savedName = sessionStorage.getItem('playerName')
      if (savedCode && savedName) {
        socket.emit('room:join', { code: savedCode, playerName: savedName }, (res) => {
          if (res.ok) {
            setRoomCode(savedCode)
            setGameState(res.state)
          }
        })
      }
    })
    socket.on('game:state', (state) => {
      setGameState(state)
    })
    socket.on('room:updated', setGameState)
    return () => socket.off()
  }, [])

  const handleJoined = (code, state, playerName) => {
    sessionStorage.setItem('roomCode', code)
    sessionStorage.setItem('playerName', playerName)
    setRoomCode(code)
    setGameState(state)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', fontFamily: 'sans-serif' }}>
      {!roomCode
        ? <Lobby socket={socket} onJoined={handleJoined} />
        : <GameTable socket={socket} roomCode={roomCode} gameState={gameState} />
      }
    </div>
  )
}
