# Texas Hold'em 领域模型文档

## 版本历史

- **V1.0** (2026-03-24): 基础游戏功能完成
  - 房间系统（创建、加入、解散）
  - 游戏引擎（发牌、下注、比牌）
  - 房主控制权限

---

## 核心对象

### 1. Card (扑克牌) - 值对象

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `suit` | `'spades' \| 'hearts' \| 'diamonds' \| 'clubs'` | 花色 |
| `rank` | `'2'-'10' \| 'J' \| 'Q' \| 'K' \| 'A'` | 点数 |
| `id` | `string` | 唯一标识，如 `'AS'`、`'10H'` |
| `value` | `number (2-14)` | 数值大小，用于比较 |

**能力：**

- 无行为，纯数据对象
- 通过 `value` 属性支持大小比较

**位置：** `server/src/game/deck.js`

---

### 2. Deck (牌组) - 工厂/服务

**能力：**

| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| `createDeck()` | - | `Card[]` | 创建标准 52 张扑克牌 |
| `shuffle(deck)` | `Card[]` | `Card[]` | Fisher-Yates 洗牌算法 |

**位置：** `server/src/game/deck.js`

---

### 3. Player (玩家) - 实体

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | Socket ID，唯一标识 |
| `name` | `string` | 玩家昵称 |
| `chips` | `number` | 当前筹码数 |
| `socketId` | `string` | WebSocket 连接 ID |
| `holeCards` | `Card[]` | 手牌（2张） |
| `bet` | `number` | 当前轮下注额 |
| `folded` | `boolean` | 是否已弃牌 |
| `allIn` | `boolean` | 是否已 All-in |
| `avatar` | `{ initial, bgGradient }` | 头像（首字母+渐变色） |
| `status` | `'online' \| 'offline' \| 'away'` | 在线状态 |
| `stats` | `{ handsPlayed, handsWon, totalProfit, winRate }` | 游戏统计 |

**位置：** `server/src/room/room.js`, `server/src/game/game-engine.js`

---

### 4. GameEngine (游戏引擎) - 核心聚合根

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `options.smallBlind` | `number` | 小盲注金额 |
| `options.bigBlind` | `number` | 大盲注金额 |
| `state.phase` | `GamePhase` | 当前游戏阶段 |
| `state.players` | `Player[]` | 参与游戏的玩家 |
| `state.communityCards` | `Card[]` | 公共牌（0-5张） |
| `state.pot` | `number` | 主池金额 |
| `state.currentBet` | `number` | 当前轮最高下注 |
| `state.lastRaiseAmount` | `number` | 最后一次加注额（用于最小加注验证） |
| `state.dealerIndex` | `number` | 庄家位置索引 |
| `state.currentPlayerIndex` | `number` | 当前行动玩家索引 |
| `state.deck` | `Card[]` | 剩余牌堆 |
| `state.actedThisStreet` | `Set<string>` | 本 street 已行动玩家 |
| `state.winner` | `string \| undefined` | 获胜者 ID |

**GamePhase 枚举：**

```javascript
'waiting' → 'preflop' → 'flop' → 'turn' → 'river' → 'showdown' → 'ended'
```

**能力：**

| 方法 | 说明 |
|------|------|
| `start()` | 开始新一手：洗牌、发手牌、下盲注 |
| `playerAction(playerId, action, amount)` | 处理玩家动作（fold/call/check/raise） |
| `nextHand()` | 进入下一手，移动庄家位置 |
| `getPublicState(forPlayerId)` | 获取对外状态（隐藏其他玩家手牌，showdown 时 reveal） |

**内部方法：**

| 方法 | 说明 |
|------|------|
| `_postBlind(idx, amount)` | 下盲注 |
| `_isRoundOver()` | 判断当前轮是否结束 |
| `_nextPlayer()` | 移动到下一位玩家 |
| `_advancePhase()` | 推进游戏阶段（preflop→flop→...） |
| `_resolveShowdown()` | 比牌决出胜者 |
| `_activePlayers()` | 获取未弃牌玩家 |

**当前问题：**

- [ ] 职责过重（流程 + 状态 + 规则）
- [ ] 缺少 Side Pot（边池）逻辑
- [ ] 缺少超时处理
- [ ] 缺少游戏历史记录

**位置：** `server/src/game/game-engine.js`

---

### 5. Room (房间) - 聚合根

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `code` | `string` | 6位房间码 |
| `name` | `string` | 房间名称 |
| `hostId` | `string` | 房主 Socket ID |
| `options.smallBlind` | `number` | 小盲注 |
| `options.bigBlind` | `number` | 大盲注 |
| `options.startingChips` | `number` | 初始筹码 |
| `options.maxPlayers` | `number` | 最大人数 |
| `players` | `Player[]` | 房间内玩家 |
| `game` | `GameEngine \| null` | 游戏实例 |
| `status` | `'lobby' \| 'playing' \| 'ended'` | 房间状态 |
| `createdAt` | `number` | 创建时间戳 |

**能力：**

| 方法 | 说明 |
|------|------|
| `addPlayer(socketPlayer)` | 添加玩家到房间 |
| `removePlayer(socketId)` | 移除玩家 |
| `startGame()` | 开始游戏（创建 GameEngine） |
| `getPublicState(forSocketId)` | 获取公开状态（包含 hostId） |

**位置：** `server/src/room/room.js`

---

### 6. RoomManager (房间管理器) - 仓储/服务

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `rooms` | `Map<string, Room>` | 房间映射表（code → Room） |

**能力：**

| 方法 | 说明 |
|------|------|
| `createRoom(options)` | 创建新房间，生成6位房间码 |
| `joinRoom(code, socketPlayer)` | 玩家加入房间 |
| `removePlayer(code, socketId)` | 从房间移除玩家 |
| `getRoom(code)` | 根据房间码获取房间 |
| `getRoomList()` | 获取可加入的房间列表（lobby 状态且未满） |
| `_generateCode()` | 生成6位房间码（排除 I, O, 1, 0） |

**位置：** `server/src/room/room-manager.js`

---

### 7. PotManager (奖池管理器) - 服务

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `pots` | `Array<{ amount, eligiblePlayers: Set }>` | 主池 + 边池数组 |

**能力：**

| 方法 | 说明 |
|------|------|
| `reset()` | 重置所有奖池 |
| `createSidePots(playerBets, allInPlayers, foldedPlayers)` | 在 street 结束时根据下注额创建边池 |
| `distributePots(playerResults, compareHands)` | 比牌并分配所有奖池 |
| `getTotalPot()` | 获取总奖池金额 |
| `getPots()` | 获取所有池的信息 |

**边池规则：**

1. 当玩家 All-in 时，如果其下注额低于当前最高注，超出部分会进入新的边池
2. All-in 玩家只能赢取主池 + 其投入的边池
3. 多个 All-in 可能创建多个边池
4. 弃牌玩家失去所有池的资格

**位置：** `server/src/game/pot-manager.js`

---

## 辅助服务

### HandEvaluator (牌型评估) - 纯函数库

**能力：**

| 方法 | 说明 |
|------|------|
| `evaluateHand(cards: Card[5])` | 评估5张牌的牌型 |
| `getBestHand(holeCards, communityCards)` | 从7张牌中选最优5张 |
| `compareHands(a, b)` | 比较两手牌大小 |

**牌型等级（高→低）：**

1. Royal Flush (皇家同花顺)
2. Straight Flush (同花顺)
3. Four of a Kind (四条)
4. Full House (葫芦)
5. Flush (同花)
6. Straight (顺子)
7. Three of a Kind (三条)
8. Two Pair (两对)
9. One Pair (一对)
10. High Card (高牌)

**位置：** `server/src/game/hand-evaluator.js`

---

### 8. Timer (倒计时器) - 服务

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `defaultDuration` | `number` | 默认倒计时时长（毫秒） |
| `remainingTime` | `number` | 当前剩余时间 |
| `isRunning` | `boolean` | 是否正在运行 |

**能力：**

| 方法 | 说明 |
|------|------|
| `start(duration, onTimeout, onTick)` | 开始倒计时 |
| `reset()` | 重置倒计时 |
| `stop()` | 停止倒计时 |
| `getRemainingTime()` | 获取剩余时间 |
| `getProgress()` | 获取进度 0-1 |

**位置：** `server/src/game/timer.js`

---

## Socket 事件

### 客户端 → 服务器

| 事件 | 参数 | 说明 |
|------|------|------|
| `room:list` | - | 获取房间列表 |
| `room:create` | `{ name, smallBlind, bigBlind, startingChips, maxPlayers, playerName }` | 创建房间 |
| `room:join` | `{ code, playerName }` | 加入房间 |
| `room:disband` | `{ code }` | 解散房间（仅房主） |
| `game:start` | `{ code }` | 开始游戏（仅房主） |
| `game:action` | `{ code, action, amount }` | 玩家动作 |
| `game:next-hand` | `{ code }` | 下一手 |

### 服务器 → 客户端

| 事件 | 参数 | 说明 |
|------|------|------|
| `room:updated` | `RoomState` | 房间状态更新 |
| `room:disbanded` | `{ reason: 'host_left' \| 'host_disbanded' }` | 房间解散通知 |
| `game:state` | `GameState` | 游戏状态更新 |

**位置：** `server/src/socket/socket-handler.js`

---

## V2 待开发功能

### 优先级：高

- [x] **Side Pot（边池）系统** (2026-03-24 完成)
- [x] **倒计时系统** (2026-03-24 完成)
  - [x] 每手限时（默认 20 秒）
  - [x] 超时自动 Fold
  - [x] 前端倒计时显示

### 优先级：中

- [x] **Player 对象增强** (2026-03-24 完成)
  - [x] 头像（首字母+渐变色背景）
  - [x] 在线状态（online/offline/away）
  - [x] 游戏统计（胜率、手数、盈亏）

- [ ] **游戏历史记录**
  - 每手牌局持久化
  - 支持回放/复盘
  - 历史记录列表

- [ ] **聊天系统**
  - 房间聊天
  - 表情/快捷消息

### 优先级：低

- [ ] **观战模式**
  - 允许非玩家观看游戏
  - 观战者列表

- [ ] **房间密码**
  - 私密房间
  - 密码验证

- [ ] **断线重连增强**
  - 重连后恢复完整游戏状态
  - 离线托管（自动 check/fold）

---

## 数据流图

```
┌─────────────┐     room:create      ┌──────────────┐
│   客户端     │ ───────────────────→ │  RoomManager │
│  (React)    │                      │   (仓储)      │
└─────────────┘                      └──────┬───────┘
       ↑                                    │
       │        room:updated               │ 创建
       │        game:state                 ↓
       └───────────────────────────    ┌─────────┐
                                       │  Room   │
                                       │ (聚合根) │
                                       └────┬────┘
                                            │
                              startGame()   │
                                            ↓
                                       ┌──────────┐
                                       │GameEngine│
                                       │(游戏引擎) │
                                       └──────────┘
```

---

*最后更新：2026-03-24*
