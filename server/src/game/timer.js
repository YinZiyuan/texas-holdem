// Timer.js - 倒计时管理器
// 用于管理玩家行动倒计时

export class Timer {
  constructor(defaultDuration = 20000) {
    this.defaultDuration = defaultDuration
    this.remainingTime = 0
    this.intervalId = null
    this.timeoutId = null
    this.onTimeoutCallback = null
    this.onTickCallback = null
    this.isRunning = false
  }

  /**
   * 开始倒计时
   * @param {number} duration - 倒计时时长（毫秒）
   * @param {Function} onTimeout - 超时回调
   * @param {Function} onTick - 每秒回调（可选）
   */
  start(duration = this.defaultDuration, onTimeout, onTick) {
    this.stop() // 确保之前的计时器已清除

    this.remainingTime = duration
    this.onTimeoutCallback = onTimeout
    this.onTickCallback = onTick
    this.isRunning = true

    const startTime = Date.now()
    const endTime = startTime + duration

    // 每秒触发 tick
    this.intervalId = setInterval(() => {
      const now = Date.now()
      this.remainingTime = Math.max(0, endTime - now)

      if (this.onTickCallback) {
        this.onTickCallback(this.remainingTime)
      }

      // 倒计时结束
      if (this.remainingTime <= 0) {
        this._triggerTimeout()
      }
    }, 1000)

    // 精确的超时触发
    this.timeoutId = setTimeout(() => {
      this._triggerTimeout()
    }, duration)

    // 立即触发一次 tick
    if (this.onTickCallback) {
      this.onTickCallback(this.remainingTime)
    }
  }

  /**
   * 重置倒计时
   */
  reset() {
    this.stop()
    this.remainingTime = 0
  }

  /**
   * 停止倒计时
   */
  stop() {
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  /**
   * 获取剩余时间（毫秒）
   */
  getRemainingTime() {
    return this.remainingTime
  }

  /**
   * 获取进度（0-1）
   */
  getProgress() {
    if (this.remainingTime <= 0) return 0
    return this.remainingTime / this.defaultDuration
  }

  /**
   * 是否正在运行
   */
  isActive() {
    return this.isRunning
  }

  /**
   * 内部方法：触发超时回调
   */
  _triggerTimeout() {
    if (!this.isRunning) return

    this.stop()
    this.remainingTime = 0

    if (this.onTimeoutCallback) {
      // 使用 setImmediate 确保在当前执行栈结束后触发
      setImmediate(() => {
        this.onTimeoutCallback()
      })
    }
  }
}
