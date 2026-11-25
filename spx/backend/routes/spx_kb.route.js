/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：知识库路由（上传、列表、删除、RAG 问答）
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const spx_kbController = require('../controllers/spx_kb.controller');

const spx_router = express.Router();

// 上传限制：内存存储、单文件 10MB、仅允许文档类扩展名
const spx_allowedExt = ['.doc', '.docx', '.ppt', '.pptx', '.pdf', '.txt', '.md'];
const spx_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (spx_req, spx_file, spx_cb) {
    const spx_ext = path.extname(spx_file.originalname).toLowerCase();
    if (spx_allowedExt.indexOf(spx_ext) === -1) {
      spx_cb(new Error('仅支持 doc / docx / ppt / pptx / pdf / txt / md 文件'));
      return;
    }
    spx_cb(null, true);
  }
});

spx_router.post('/kb/upload', spx_upload.single('file'), spx_kbController.spx_upload);
spx_router.get('/kb/files', spx_kbController.spx_files);
spx_router.delete('/kb/files/:id', spx_kbController.spx_delete);
spx_router.post('/kb/ask', spx_kbController.spx_ask);

module.exports = spx_router;
