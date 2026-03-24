# 倒计时系统设计文档

## 1. 需求分析

### 功能需求
- 每手牌玩家有固定思考时间（默认 20 秒）
- 当前行动玩家显示倒计时
- 超时后自动执行 Fold
- 玩家操作后重置倒计时

### 非功能需求
- 倒计时在服务器端权威控制（防止客户端作弊）
- 网络延迟补偿
- 前端实时同步显示

---

## 2. 架构设计

### 2.1 组件关系

```
┌─────────────┐      start/reset      ┌─────────────┐
│ GameEngine  │ ←───────────────────→ │    Timer    │
│             │  getRemainingTime()   │             │
│  - 管理游戏  │                       │  - 倒计时逻辑 │
│  - 触发动作  │ ────────────────────→ │  - 超时回调   │
└─────────────┘   onTimeout(callback)  └─────────────┘
       │
       │ game:state (包含 remainingTime)
       ↓
┌─────────────┐
│   客户端     │
│             │
│  - 显示倒计时 │
│  - 进度条动画 │
└─────────────┘
```

### 2.2 状态流转

```
轮到玩家A行动
    ↓
Timer.start(20000ms)
    ↓
每秒广播 remainingTime
    ↓
┌─────────────────────┐
│   玩家A在时限内操作？  │
└─────────────────────┘
    ↓ 是              ↓ 否
Timer.reset()    触发 Fold
    ↓
进入下一玩家
```

---

## 3. 接口设计

### 3.1 Timer 类

```javascript
class Timer {
  constructor(defaultDuration = 20000)

  // 方法
  start(callback)           // 开始倒计时，超时执行 callback
  reset()                   // 重置倒计时
  stop()                    // 停止倒计时
  getRemainingTime()        // 获取剩余毫秒数
  getProgress()             // 获取进度 0-1

  // 事件
  onTick(callback)          // 每秒回调（用于广播）
}
```

### 3.2 GameEngine 集成

```javascript
GameEngine {
  state: {
    timer: Timer,
    currentPlayerId: string,
    remainingTime: number  // 发送到客户端
  }

  // 新方法
  _startTimerForPlayer(playerId)
  _onTimeout(playerId)     // 超时自动 Fold
}
```

### 3.3 Socket 事件扩展

```javascript
// 服务器 → 客户端（新增字段）
game:state {
  ...existingFields,
  remainingTime: number,    // 剩余毫秒
  totalTime: number,        // 总时长（默认 20000）
  currentPlayerId: string   // 当前行动玩家
}
```

---

## 4. 前端设计

### 4.1 倒计时显示组件

```jsx
<TimerDisplay
  remainingTime={game.remainingTime}
  totalTime={game.totalTime}
  isMyTurn={game.currentPlayerId === myId}
/>
```

### 4.2 UI 样式

- 正常状态：绿色进度条
- 剩余 5 秒：黄色警告
- 剩余 3 秒：红色警告 + 闪烁
- 倒计时时显示在 ActionPanel 上方

---

## 5. 实现步骤

1. [ ] 创建 Timer 类 (`server/src/game/timer.js`)
2. [ ] GameEngine 集成 Timer
3. [ ] 前端 TimerDisplay 组件
4. [ ] ActionPanel 集成倒计时
5. [ ] 测试各种场景

---

## 6. 边界情况

| 场景 | 处理方案 |
|------|----------|
| 玩家刚好在最后一秒操作 | 网络延迟容差 500ms，防止重复 Fold |
| 玩家断线 | 倒计时继续，超时 Fold |
| 游戏进入下一阶段 | 重置倒计时 |
| 只剩一名活跃玩家 | 停止倒计时 |

---

## 7. 后续优化（V2+）

- [ ] 可配置倒计时时长（房主设置）
- [ ] 银行时间（Time Bank）：玩家额外思考时间
- [ ] 暂停功能（需所有玩家同意）

---

*创建时间：2026-03-24*
