// avatar.js - 头像生成工具

// 预定义的渐变色方案
const AVATAR_COLORS = [
  ['#667eea', '#764ba2'], // 紫蓝
  ['#f093fb', '#f5576c'], // 粉紫
  ['#4facfe', '#00f2fe'], // 蓝色
  ['#43e97b', '#38f9d7'], // 青绿
  ['#fa709a', '#fee140'], // 橙粉
  ['#30cfd0', '#330867'], // 深紫
  ['#a8edea', '#fed6e3'], // 淡彩
  ['#ff9a9e', '#fecfef'], // 粉色
  ['#ffecd2', '#fcb69f'], // 暖橙
  ['#667eea', '#764ba2'], // 紫蓝
]

/**
 * 生成头像配置
 * @param {string} name - 玩家名称
 * @returns {Object} 头像配置 { initial, bgGradient }
 */
export function generateAvatar(name) {
  const initial = name.charAt(0).toUpperCase()

  // 根据名称生成固定的颜色索引（保证同一名称总是同一颜色）
  const colorIndex = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_COLORS.length
  const [startColor, endColor] = AVATAR_COLORS[colorIndex]

  return {
    initial,
    bgGradient: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`
  }
}

/**
 * 创建初始统计对象
 * @returns {Object} 统计对象
 */
export function createInitialStats() {
  return {
    handsPlayed: 0,
    handsWon: 0,
    totalProfit: 0,
    winRate: 0
  }
}

/**
 * 更新胜率
 * @param {Object} stats - 统计对象
 */
export function updateWinRate(stats) {
  if (stats.handsPlayed === 0) {
    stats.winRate = 0
  } else {
    stats.winRate = Math.round((stats.handsWon / stats.handsPlayed) * 100)
  }
}
