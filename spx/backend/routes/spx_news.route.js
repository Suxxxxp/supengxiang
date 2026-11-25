/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：科技新闻接口路由
 */

const spx_express = require('express');
const spx_router = spx_express.Router();
const spx_newsController = require('../controllers/spx_news.controller');

spx_router.get('/news', spx_newsController.spx_getNewsList);

module.exports = spx_router;
