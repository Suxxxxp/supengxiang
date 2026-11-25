/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：语音识别路由（上传音频并返回文字）
 */

const express = require('express');
const multer = require('multer');
const spx_asrController = require('../controllers/spx_asr.controller');

const spx_router = express.Router();

// 允许常见音频格式，单文件不超过 20MB
const spx_allowedExt = ['.wav', '.mp3', '.m4a', '.webm', '.ogg', '.amr'];
const spx_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: function (spx_req, spx_file, spx_cb) {
    const spx_ext = (spx_file.originalname.match(/\.[^.]+$/) || [''])[0].toLowerCase();
    if (spx_allowedExt.indexOf(spx_ext) === -1) {
      spx_cb(new Error('仅支持 wav / mp3 / m4a / webm / ogg / amr 音频'));
      return;
    }
    spx_cb(null, true);
  }
});

spx_router.post('/asr', spx_upload.single('audio'), spx_asrController.spx_asr);

module.exports = spx_router;
