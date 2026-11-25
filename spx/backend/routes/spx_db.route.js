/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：数据库相关接口路由
 */

const spx_express = require('express');
const spx_router = spx_express.Router();
const spx_dbController = require('../controllers/spx_db.controller');

spx_router.post('/db-test', spx_dbController.spx_testDatabase);

module.exports = spx_router;
