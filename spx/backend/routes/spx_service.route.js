/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：在线客服接口路由
 */

const spx_express = require('express');
const spx_router = spx_express.Router();
const spx_serviceController = require('../controllers/spx_service.controller');

spx_router.post('/service', spx_serviceController.spx_service);

module.exports = spx_router;
