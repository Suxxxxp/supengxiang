// 宿鹏翔：Express 数据服务器，端口 3004，提供诗词列表 API
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3004;

// 宿鹏翔：全局 CORS，允许前端页面跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 宿鹏翔：读取同目录下 db.json
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// 宿鹏翔：GET /api/poems 返回全部诗词
app.get('/api/poems', (req, res) => {
  res.json(db.poems);
});

// 宿鹏翔：GET /api/poems/:idx 按下标返回单条
app.get('/api/poems/:idx', (req, res) => {
  const idx = parseInt(req.params.idx, 10);
  const poem = db.poems[idx];
  if (poem) res.json(poem);
  else res.status(404).json({ error: 'poem not found' });
});

app.listen(PORT, () => {
  console.log(`宿鹏翔：数据服务器已启动 → http://localhost:${PORT}/api/poems`);
});
