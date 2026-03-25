# Texas Hold'em 部署与更新指南

> 服务器 IP: 8.130.110.21
> 部署时间: 2026-03-26

---

## 当前部署状态

| 服务 | 地址 | 进程 | 启动方式 |
|------|------|------|----------|
| 前端 | http://8.130.110.21 | 9898 | Python HTTP |
| 后端 API | http://8.130.110.21:3001 | 8202 | Node.js |

---

## 快速更新（推荐）

### 一键更新脚本

```bash
# 在服务器执行
sudo bash /www/wwwroot/update.sh
```

### 手动更新步骤

```bash
# 1. 进入项目目录
cd /www/wwwroot/texas-holdem

# 2. 拉取最新代码
git pull origin main

# 3. 重启后端
pkill -f "node src/server.js"
cd server
nohup node src/server.js &

# 4. 重建前端
cd ../client
npm install --legacy-peer-deps
export VITE_SOCKET_URL=http://8.130.110.21:3001
npm run build
```

---

## 详细操作说明

### 后端更新（server 目录）

```bash
cd /www/wwwroot/texas-holdem/server

# 拉取代码后，如有新依赖
npm install

# 重启服务
ps aux | grep "node src/server.js"  # 查看进程号
kill [进程号]  # 结束旧进程
nohup node src/server.js &  # 启动新进程
```

### 前端更新（client 目录）

```bash
cd /www/wwwroot/texas-holdem/client

# 安装依赖（如有更新）
npm install --legacy-peer-deps

# 构建（注意环境变量）
export VITE_SOCKET_URL=http://8.130.110.21:3001
npm run build

# 前端自动生效（Python HTTP 直接读取 dist 目录）
```

---

## 服务器重启后恢复

如果服务器重启，需要手动启动服务：

```bash
# 启动后端
cd /www/wwwroot/texas-holdem/server
nohup node src/server.js &

# 启动前端
cd /www/wwwroot/texas-holdem/client/dist
sudo nohup python3 -m http.server 80 &
```

---

## 查看运行状态

```bash
# 查看所有进程
ps aux | grep node
ps aux | grep python

# 测试后端是否正常运行
curl http://localhost:3001/health
# 应返回 {"ok":true}
```

---

## 防火墙配置

如需添加新端口，在阿里云轻量服务器防火墙：
- 类型: 自定义
- 协议: TCP
- 端口: [端口号]
- 来源IP: 0.0.0.0/0

---

## 项目路径

```
/www/wwwroot/texas-holdem/
├── client/          # 前端代码
│   ├── src/         # 源代码
│   └── dist/        # 构建输出（Nginx/Python 服务此目录）
├── server/          # 后端代码
│   └── src/
│       └── server.js    # 入口文件
└── memory/          # 开发文档
```

---

## 常见问题

### 前端构建失败
```bash
# 使用 --legacy-peer-deps 解决依赖冲突
npm install --legacy-peer-deps
```

### 端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3001

# 结束进程
sudo kill -9 [进程号]
```

### git pull 冲突
```bash
# 强制覆盖本地修改（谨慎使用）
git fetch origin
git reset --hard origin/main
```

---

*最后更新: 2026-03-26*
