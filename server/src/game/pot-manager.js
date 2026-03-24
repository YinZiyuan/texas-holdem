// Side Pot 管理器
// 边池规则：当玩家 All-in 时，如果其下注额低于当前最高注，
// 后续玩家的超额部分会进入新的边池，All-in 玩家无权赢取

export class PotManager {
  constructor() {
    // pots[0] 是主池，pots[1+] 是边池
    // 每个 pot: { amount: number, eligiblePlayers: Set<playerId> }
    this.pots = []
    this.reset()
  }

  reset() {
    this.pots = [{ amount: 0, eligiblePlayers: new Set() }]
  }

  /**
   * 下注时处理边池
   * @param {string} playerId - 下注玩家ID
   * @param {number} amount - 下注金额
   * @param {boolean} isAllIn - 是否All-in
   * @param {Object} playerBets - 所有玩家本轮已下注额 { playerId: amount }
   */
  placeBet(playerId, amount, isAllIn, playerBets) {
    // 当前玩家下注后的总额
    const currentPlayerTotal = (playerBets[playerId] || 0) + amount

    // 找到当前最高注（不含当前这次）
    const maxBet = Math.max(0, ...Object.values(playerBets))

    let remaining = amount

    // 情况1：当前玩家追平或超过最高注
    // 或者当前还没有其他下注
    if (currentPlayerTotal <= maxBet || maxBet === 0) {
      // 简单情况：直接加到主池
      this._addToPot(0, playerId, remaining, isAllIn)
      return
    }

    // 情况2：当前玩家下注超过了最高注（raise 或 All-in 不足额）
    // 需要分摊到不同的池

    // 首先，填满到最高注的部分进入主池
    const toMatchMax = maxBet - (playerBets[playerId] || 0)
    if (toMatchMax > 0) {
      this._addToPot(0, playerId, toMatchMax, isAllIn)
      remaining -= toMatchMax
    }

    // 剩余部分是 raise
    if (remaining > 0) {
      if (isAllIn && currentPlayerTotal < maxBet + remaining) {
        // All-in 金额不足，需要创建边池给其他人
        // 实际上这种情况不会发生，因为前面已经判断 currentPlayerTotal > maxBet
      }

      // 找到或创建合适的池
      // 如果玩家没有 All-in，或者 All-in 金额足够，raise 进入主池
      this._addToPot(0, playerId, remaining, isAllIn)
    }
  }

  /**
   * 在 street 结束时创建边池
   * 这是边池的主要创建时机
   * @param {Object} playerBets - 所有玩家本轮总下注额 { playerId: amount }
   * @param {Set<string>} allInPlayers - All-in 的玩家ID集合
   * @param {Set<string>} foldedPlayers - 弃牌的玩家ID集合
   * @param {Set<string>} activePlayers - 还在游戏中的玩家ID集合（未fold且未allin）
   */
  createSidePots(playerBets, allInPlayers, foldedPlayers, activePlayers) {
    // 重置奖池
    this.reset()

    // 收集所有参与下注的玩家（排除弃牌的）
    const contributingPlayers = Object.keys(playerBets).filter(
      id => !foldedPlayers.has(id) && playerBets[id] > 0
    )

    if (contributingPlayers.length === 0) return

    // 按下注额从小到大排序
    const sortedPlayers = contributingPlayers
      .map(id => ({ id, bet: playerBets[id] }))
      .sort((a, b) => a.bet - b.bet)

    let processedAmount = 0

    for (let i = 0; i < sortedPlayers.length; i++) {
      const { id, bet } = sortedPlayers[i]
      const potAmount = (bet - processedAmount) * (sortedPlayers.length - i)

      if (potAmount > 0) {
        // 确定这个池的合格玩家（下注额 >= bet 的玩家）
        const eligiblePlayers = sortedPlayers
          .slice(i)
          .map(p => p.id)

        this.pots.push({
          amount: potAmount,
          eligiblePlayers: new Set(eligiblePlayers)
        })
      }

      processedAmount = bet
    }

    // 第一个池是主池，移除非合格的弃牌玩家
    if (this.pots.length > 0) {
      for (const pot of this.pots) {
        for (const foldedId of foldedPlayers) {
          pot.eligiblePlayers.delete(foldedId)
        }
      }
    }

    // 移除空的 pots
    this.pots = this.pots.filter(p => p.amount > 0)
    if (this.pots.length === 0) {
      this.reset()
    }
  }

  // 内部方法：添加到指定池
  _addToPot(potIndex, playerId, amount, isAllIn) {
    // 确保池存在
    while (this.pots.length <= potIndex) {
      this.pots.push({ amount: 0, eligiblePlayers: new Set() })
    }

    const pot = this.pots[potIndex]
    pot.amount += amount
    pot.eligiblePlayers.add(playerId)
  }

  // 获取总奖池
  getTotalPot() {
    return this.pots.reduce((sum, p) => sum + p.amount, 0)
  }

  // 获取所有池的信息
  getPots() {
    return this.pots.map(p => ({
      amount: p.amount,
      eligiblePlayers: Array.from(p.eligiblePlayers)
    }))
  }

  // 获取特定玩家有资格赢取的池总额
  getEligiblePotForPlayer(playerId) {
    return this.pots
      .filter(p => p.eligiblePlayers.has(playerId))
      .reduce((sum, p) => sum + p.amount, 0)
  }

  /**
   * 比牌并分配奖池
   * @param {Array} playerResults - [{ playerId, hand }, ...] 每个 eligible 玩家的牌
   * @param {Function} compareHands - 比较函数 (handA, handB) => number
   * @returns {Array} - [{ playerId, amount }, ...] 分配结果
   */
  distributePots(playerResults, compareHands) {
    const distributions = []

    for (const pot of this.pots) {
      if (pot.amount === 0) continue

      // 筛选有资格的玩家
      const eligible = playerResults.filter(pr =>
        pot.eligiblePlayers.has(pr.playerId)
      )

      if (eligible.length === 0) continue

      // 比牌
      eligible.sort((a, b) => compareHands(b.hand, a.hand))
      const bestHand = eligible[0].hand
      const winners = eligible.filter(e => compareHands(e.hand, bestHand) === 0)

      // 分配
      const winAmount = Math.floor(pot.amount / winners.length)
      const remainder = pot.amount - winAmount * winners.length

      winners.forEach((w, idx) => {
        distributions.push({
          playerId: w.playerId,
          amount: winAmount + (idx === 0 ? remainder : 0),
          potAmount: pot.amount,
          isSplit: winners.length > 1
        })
      })
    }

    return distributions
  }
}
