# Texas Hold'em 项目同步指南

> 用于在公司/家里两台电脑间同步项目状态

## 项目地址
- **GitHub**: https://github.com/YinZiyuan/texas-holdem
- **本地路径**: `~/Projects/texas-holdem` (建议统一放此路径)

## 快速开始（新电脑）

```bash
# 1. 克隆项目
git clone https://github.com/YinZiyuan/texas-holdem.git

# 2. 安装依赖
cd texas-holdem/server && npm install
cd ../client && npm install --legacy-peer-deps

# 3. 启动
cd server && node src/server.js &
cd client && npx vite
```

## 日常同步流程

### 工作前（拉取最新代码）
```bash
cd texas-holdem
git pull origin main
```

### 工作后（提交并推送）
```bash
cd texas-holdem
git add -A
git commit -m "描述你的更改"
git push origin main
```

## 项目结构

```
texas-holdem/
├── server/                 # Node.js 后端
│   ├── src/
│   │   ├── game/          # 游戏逻辑 (deck, hand-evaluator, game-engine)
│   │   ├── room/          # 房间管理 (room, room-manager)
│   │   ├── socket/        # Socket.io 事件处理
│   │   └── server.js      # 入口
│   └── tests/             # 单元测试 (35个)
├── client/                # React 前端
│   ├── src/components/    # UI 组件
│   │   ├── Lobby.jsx      # 大厅 (创建/加入房间)
│   │   ├── GameTable.jsx  # 游戏桌
│   │   ├── PlayerSeat.jsx # 玩家座位
│   │   ├── ActionPanel.jsx# 操作面板
│   │   └── CommunityCards.jsx # 公共牌
│   └── src/App.jsx        # 主应用
├── README.md              # 项目说明
└── V2-TODO.md             # v2 功能规划
```

## 当前状态（v1.0）

### ✅ 已完成
- [x] 创建/加入房间（6位邀请码）
- [x] 游戏逻辑完整（发牌、下注、比牌）
- [x] 支持弃牌/跟注/过牌/加注/全押
- [x] Apple 风格 UI（深色毛玻璃）
- [x] 断线重连
- [x] 35个单元测试全部通过

### 🐛 已知问题
- 暂无

### 📝 待做（v2）
见 `V2-TODO.md`

## 开发常用命令

```bash
# 测试后端
cd server && npm test

# 构建前端
cd client && npm run build

# 本地开发启动
cd server && node src/server.js      # 端口 3001
cd client && npx vite               # 端口 5173
```

## 注意事项

1. **Node.js 版本**: 需要 v18+
2. **端口占用**: 确保 3001 和 5173 未被占用
3. **依赖安装**: client 需要用 `--legacy-peer-deps`
4. **Token 失效**: 如果 push 提示认证失败，需要重新生成 Personal Access Token

## 最后更新
2026-03-23 - Apple 风格 UI 完成
