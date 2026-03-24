// TimerDisplay.jsx - 倒计时显示组件
export default function TimerDisplay({ remainingTime, totalTime, isMyTurn }) {
  if (!isMyTurn || remainingTime === undefined) return null

  const progress = remainingTime / totalTime
  const seconds = Math.ceil(remainingTime / 1000)

  // 根据剩余时间确定颜色
  let color = '#30d158' // 绿色（正常）
  let warning = false
  if (seconds <= 3) {
    color = '#ff453a' // 红色（紧急）
    warning = true
  } else if (seconds <= 5) {
    color = '#ff9500' // 橙色（警告）
    warning = true
  }

  return (
    <div style={styles.container}>
      <div style={styles.progressBarBg}>
        <div
          style={{
            ...styles.progressBarFill,
            width: `${progress * 100}%`,
            background: color,
            animation: warning ? 'pulse 0.5s ease-in-out infinite' : 'none',
          }}
        />
      </div>
      <div style={{ ...styles.timeText, color }}>
        {seconds}秒
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    padding: '12px 24px',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease, background 0.3s ease',
  },
  timeText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
    fontFamily: 'SF Mono, Monaco, monospace',
  },
}