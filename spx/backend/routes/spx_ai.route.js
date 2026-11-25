/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：AI 聊天接口路由
 */

const spx_express = require('express');
const spx_router = spx_express.Router();
const spx_aiController = require('../controllers/spx_ai.controller');

spx_router.get('/chat/providers', spx_aiController.spx_chatProviders);
spx_router.post('/chat', spx_aiController.spx_chat);

module.exports = spx_router;
