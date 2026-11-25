/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：数据库连接测试的数据层（使用 mysql2 临时连接 MySQL 并查询版本号）
 */

const spx_mysql = require('mysql2/promise');

/**
 * 使用传入的账号密码创建临时连接，返回 MySQL 版本号
 * 账号或密码为空时回退到 backend/.env 中的配置
 */
async function spx_testConnection(spx_user, spx_password) {
  const spx_connection = await spx_mysql.createConnection({
    host: process.env.DB_HOST,
    user: spx_user || process.env.DB_USER,
    password: spx_password || process.env.DB_PASSWORD,
    connectTimeout: 5000
  });

  try {
    const [spx_rows] = await spx_connection.query('SELECT VERSION() AS version');
    return spx_rows[0].version;
  } finally {
    await spx_connection.end();
  }
}

module.exports = { spx_testConnection };
