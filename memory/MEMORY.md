# Texas Hold'em 项目记忆

## 项目概述

多人在线德州扑克游戏，Node.js + Socket.io + React

## 关键文档

- **[领域模型](domain-model.md)** - 完整的对象属性和能力梳理
- **[V2 Roadmap](../docs/ROADMAP.md)** - 版本规划

## 项目结构

```
texas-holdem/
├── client/           # React 19 + Vite 前端
│   └── src/
│       ├── components/
│       │   ├── Lobby.jsx       # 大厅（房间列表、创建/加入）
│       │   ├── GameTable.jsx   # 游戏桌
│       │   ├── ActionPanel.jsx # 操作面板
│       │   ├── PlayerSeat.jsx  # 玩家座位
│       │   └── CommunityCards.jsx # 公共牌
│       └── App.jsx
├── server/           # Node.js + Socket.io 后端
│   └── src/
│       ├── room/
│       │   ├── room.js         # Room 实体
│       │   └── room-manager.js # 房间管理
│       ├── game/
│       │   ├── game-engine.js  # 游戏引擎
│       │   ├── deck.js         # 牌组
│       │   └── hand-evaluator.js # 牌型评估
│       └── socket/
│           └── socket-handler.js # Socket 事件
```

## 开发约定

- 所有功能先写进 `memory/domain-model.md` 再实现
- V1 已完成：基础游戏 + 房主控制
- V2 重点：Side Pot + 倒计时系统
