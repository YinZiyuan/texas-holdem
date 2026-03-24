import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Lobby from './components/Lobby'
import GameTable from './components/GameTable'

const socket = io('http://localhost:3001')

export default function App() {
  const [roomCode, setRoomCode] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [disbandNotification, setDisbandNotification] = useState(null)

  useEffect(() => {
    socket.on('connect', () => {
      const savedCode = sessionStorage.getItem('roomCode')
      const savedName = sessionStorage.getItem('playerName')
      if (savedCode && savedName) {
        socket.emit('room:join', { code: savedCode, playerName: savedName }, (res) => {
          if (res.ok) {
            setRoomCode(savedCode)
            setGameState(res.state)
          } else {
            sessionStorage.removeItem('roomCode')
            sessionStorage.removeItem('playerName')
          }
        })
      }
    })
    socket.on('game:state', setGameState)
    socket.on('room:updated', setGameState)
    socket.on('room:disbanded', ({ reason }) => {
      const message = reason === 'host_left'
        ? '房主已退出，房间已解散'
        : '房间已被房主解散'
      setDisbandNotification(message)
      // Clear room data
      sessionStorage.removeItem('roomCode')
      sessionStorage.removeItem('playerName')
      setRoomCode(null)
      setGameState(null)
    })
    return () => socket.off()
  }, [])

  const handleJoined = (code, state, playerName) => {
    sessionStorage.setItem('roomCode', code)
    sessionStorage.setItem('playerName', playerName)
    setRoomCode(code)
    setGameState(state)
  }

  const handleLeave = () => {
    sessionStorage.removeItem('roomCode')
    sessionStorage.removeItem('playerName')
    setRoomCode(null)
    setGameState(null)
  }

  const handleCloseNotification = () => {
    setDisbandNotification(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {!roomCode
        ? <Lobby socket={socket} onJoined={handleJoined} />
        : <GameTable socket={socket} roomCode={roomCode} gameState={gameState} onLeave={handleLeave} />
      }
      {disbandNotification && (
        <DisbandModal message={disbandNotification} onClose={handleCloseNotification} />
      )}
    </div>
  )
}

function DisbandModal({ message, onClose }) {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <div style={modalStyles.icon}>📢</div>
        <div style={modalStyles.message}>{message}</div>
        <button style={modalStyles.btn} onClick={onClose}>确定</button>
      </div>
    </div>
  )
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  container: {
    background: 'rgba(28,28,30,0.95)',
    borderRadius: 20,
    padding: '32px 40px',
    textAlign: 'center',
    maxWidth: 320,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 24,
    lineHeight: 1.5,
  },
  btn: {
    padding: '14px 32px',
    borderRadius: 12,
    border: 'none',
    background: '#0a84ff',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
}
