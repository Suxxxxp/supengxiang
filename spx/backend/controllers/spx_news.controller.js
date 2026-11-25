/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：科技新闻接口的控制层
 */

const spx_newsModel = require('../models/spx_news.model');

/**
 * GET /api/news
 * 返回全部科技新闻（按发布时间倒序）
 */
async function spx_getNewsList(spx_req, spx_res) {
  try {
    const spx_newsList = await spx_newsModel.spx_getAllNews();
    spx_res.json({
      code: 0,
      msg: '获取新闻列表成功',
      data: spx_newsList
    });
  } catch (spx_err) {
    spx_res.json({
      code: 500,
      msg: '获取新闻列表失败：' + spx_err.message,
      data: null
    });
  }
}

module.exports = { spx_getNewsList };
