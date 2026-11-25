/* 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash */

const spx_path = require('path');
const spx_express = require('express');
const spx_cors = require('cors');
require('dotenv').config();

const spx_app = spx_express();
const spx_port = 8405;

spx_app.use(spx_cors());
spx_app.use(spx_express.json());
spx_app.use(spx_express.static(spx_path.join(__dirname, '..', 'frontend')));

// 业务接口路由（统一挂在 /api 前缀下）
spx_app.use('/api', require('./routes/spx_db.route'));
spx_app.use('/api', require('./routes/spx_news.route'));
spx_app.use('/api', require('./routes/spx_gallery.route'));
spx_app.use('/api', require('./routes/spx_ai.route'));
spx_app.use('/api', require('./routes/spx_service.route'));
spx_app.use('/api', require('./routes/spx_kb.route'));
spx_app.use('/api', require('./routes/spx_vision.route'));
spx_app.use('/api', require('./routes/spx_asr.route'));

// 上传等中间件异常统一转成标准 JSON，避免返回 HTML 堆栈
spx_app.use('/api', function (spx_err, spx_req, spx_res, spx_next) {
  if (!spx_err) {
    spx_next();
    return;
  }
  const spx_msg = spx_err.code === 'LIMIT_FILE_SIZE' ? '文件超过大小限制' : spx_err.message;
  spx_res.status(400).json({ code: 400, msg: '上传失败：' + spx_msg, data: null });
});

// /api 下未匹配到的请求统一返回标准 JSON 格式
spx_app.use('/api', function (spx_req, spx_res) {
  spx_res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

spx_app.listen(spx_port, function () {
  console.log('服务已启动：http://localhost:' + spx_port);
});
