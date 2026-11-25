/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图文列表接口路由
 */

const spx_express = require('express');
const spx_router = spx_express.Router();
const spx_galleryController = require('../controllers/spx_gallery.controller');

spx_router.get('/gallery', spx_galleryController.spx_getGalleryList);

module.exports = spx_router;
