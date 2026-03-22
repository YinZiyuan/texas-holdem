import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Lobby from './components/Lobby'
import GameTable from './components/GameTable'

const socket = io('http://localhost:3001')

export default function App() {
  const [roomCode, setRoomCode] = useState(null)
  const [gameState, setGameState] = useState(null)

  useEffect(() => {
    socket.on('game:state', setGameState)
    socket.on('room:updated', (state) => setGameState(state))
    return () => { socket.off('game:state'); socket.off('room:updated') }
  }, [])

  const handleJoined = (code, state) => {
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
