# Texas Hold'em — v2 Roadmap

Features deferred from v1, to be built after v1 is verified.

## Planned Features

### 用户账号 / 登录
- 昵称持久化（localStorage 或账号体系）
- 可选：微信/GitHub OAuth

### 数据库持久化
- 游戏记录存储（胜负、筹码变化）
- 房间状态持久化（服务器重启不丢失）
- 推荐：SQLite（轻量）或 Redis（快）

### 虚拟货币 / 排行榜
- 玩家账户筹码跨局保留
- 排行榜（胜率、总赢筹码）

### 观战模式
- 非玩家可加入房间旁观
- 看到所有公共牌，看不到其他玩家底牌

## Other Improvements (发现的优化点)
- 加注额度验证（最小加注 = 上一次加注额）
- 边池（Side pot）支持 —— 多人全押时正确分锅
- 手牌历史记录（本局走势回放）
- 移动端手势优化

---
记录于 v1 完成后，等用户测试反馈再排优先级。
