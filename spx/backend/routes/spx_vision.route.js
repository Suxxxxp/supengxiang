/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图像识别路由（上传图片并返回文字描述）
 */

const express = require('express');
const multer = require('multer');
const spx_visionController = require('../controllers/spx_vision.controller');

const spx_router = express.Router();

// 仅允许常见图片格式，单文件不超过 8MB（base64 后约 10.7MB）
const spx_allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const spx_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: function (spx_req, spx_file, spx_cb) {
    if (spx_allowedMimes.indexOf(spx_file.mimetype) === -1) {
      spx_cb(new Error('仅支持 jpg / jpeg / png / webp / gif 图片'));
      return;
    }
    spx_cb(null, true);
  }
});

spx_router.post('/vision', spx_upload.single('image'), spx_visionController.spx_vision);

module.exports = spx_router;
