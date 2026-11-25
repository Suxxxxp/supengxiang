/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图文列表接口的控制层
 */

const spx_galleryModel = require('../models/spx_gallery.model');

/**
 * GET /api/gallery
 * 返回全部图文数据（按创建时间倒序）
 */
async function spx_getGalleryList(spx_req, spx_res) {
  try {
    const spx_galleryList = await spx_galleryModel.spx_getAllGallery();
    spx_res.json({
      code: 0,
      msg: '获取图文列表成功',
      data: spx_galleryList
    });
  } catch (spx_err) {
    spx_res.json({
      code: 500,
      msg: '获取图文列表失败：' + spx_err.message,
      data: null
    });
  }
}

module.exports = { spx_getGalleryList };
