# Player 增强系统设计文档

## 1. 需求分析

### 功能需求
- 玩家头像（随机生成或首字母）
- 在线状态：在线 / 离线 / 离开
- 游戏统计：胜率、总手数、总盈亏

### 展示位置
- 游戏桌座位（PlayerSeat 组件）
- 大厅玩家列表（Lobby）

---

## 2. 数据模型

### Player 对象增强

```javascript
{
  // 原有字段
  id: string,
  name: string,
  chips: number,
  socketId: string,

  // 新增字段
  avatar: string,           // 头像 URL 或颜色代码
  status: 'online' | 'offline' | 'away',
  stats: {
    handsPlayed: number,    // 总手数
    handsWon: number,       // 获胜手数
    totalProfit: number,    // 总盈亏
    winRate: number         // 胜率 (0-100)
  }
}
```

### Avatar 生成策略

选项1：首字母 + 随机渐变色（简单）
```javascript
avatar: {
  type: 'initial',
  initial: 'A',
  bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}
```

选项2：DiceBear API（外部服务）
```javascript
avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=playerName'
```

**选择：选项1**（不依赖外部服务，离线可用）

---

## 3. 状态管理

### 状态流转

```
在线(online)
   ↓ 断线 / 30秒无响应
离线(offline)
   ↓ 手动设置 / 5分钟无操作
离开(away)
```

### 状态检测

- **online**: socket 连接正常
- **offline**: socket 断开
- **away**: 需前端发送心跳，或手动设置

---

## 4. 统计计算

### 统计更新时机

| 事件 | 更新字段 |
|------|----------|
| 每手结束 | handsPlayed++ |
| 玩家获胜 | handsWon++, totalProfit += winAmount |
| 玩家输掉 | totalProfit -= lossAmount |

### 胜率计算
```javascript
winRate = Math.round((handsWon / handsPlayed) * 100)
```

---

## 5. 接口变更

### Socket 事件扩展

```javascript
// game:state 中 players 增加字段
players: [{
  id, name, chips, bet, folded, allIn, holeCards, eligiblePot,
  // 新增
  avatar: { initial, bgColor },
  status: 'online' | 'offline' | 'away',
  stats: { handsPlayed, handsWon, totalProfit, winRate }
}]
```

### 新增事件

```javascript
// 玩家设置状态
socket.emit('player:set-status', { roomCode, status: 'away' })

// 服务器广播状态变更
socket.on('player:status-changed', { playerId, status })
```

---

## 6. UI 设计

### PlayerSeat 组件

```
┌─────────────────────────┐
│  ┌─────┐                │
│  │  A  │  PlayerName     │  ← 头像（首字母+渐变色背景）
│  └─────┘  💰1000         │  ← 筹码数
│     🟢    🏆 45% (12/30) │  ← 状态圆点 + 胜率
└─────────────────────────┘
```

### 状态指示器

- 🟢 绿色圆点：online
- 🔴 红色圆点：offline
- 🟡 黄色圆点：away

---

## 7. 实现步骤

1. [ ] 创建 Avatar 生成工具函数
2. [ ] Player 对象增加 avatar/status/stats 字段
3. [ ] GameEngine 统计更新逻辑
4. [ ] Socket handler 状态管理
5. [ ] PlayerSeat 组件显示头像和状态
6. [ ] 大厅玩家列表显示状态

---

## 8. 后续优化

- [ ] 支持上传自定义头像
- [ ] 更多头像风格选项
- [ ] 排行榜（Top Winners）

---

*创建时间：2026-03-24*
