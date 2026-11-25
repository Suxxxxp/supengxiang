/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：数据库连接测试接口的控制层（解析账号密码、返回统一 JSON 结果）
 */

const spx_dbModel = require('../models/spx_db.model');

/**
 * POST /api/db-test
 * 请求体：{ user: 'root', password: 'root' }
 */
async function spx_testDatabase(spx_req, spx_res) {
  const spx_body = spx_req.body || {};
  const spx_user = typeof spx_body.user === 'string' ? spx_body.user.trim() : '';
  const spx_password = typeof spx_body.password === 'string' ? spx_body.password : '';

  try {
    const spx_version = await spx_dbModel.spx_testConnection(spx_user, spx_password);
    spx_res.json({
      code: 0,
      msg: '数据库连接成功',
      data: { version: spx_version }
    });
  } catch (spx_err) {
    spx_res.json({
      code: 500,
      msg: '数据库连接失败：' + spx_err.message,
      data: null
    });
  }
}

module.exports = { spx_testDatabase };
