/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图文列表数据层（创建连接池，查询全部图文数据）
 */

const spx_mysql = require('mysql2/promise');

// 数据库连接池，凭据全部来自 backend/.env
const spx_pool = spx_mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// 查询全部图文数据，按创建时间倒序返回
async function spx_getAllGallery() {
  const [spx_rows] = await spx_pool.query(
    'SELECT id, title, description, img_url, category, ' +
    "DATE_FORMAT(create_time, '%Y-%m-%d %H:%i') AS create_time " +
    'FROM spx_gallery ORDER BY create_time DESC, id DESC'
  );
  return spx_rows;
}

module.exports = { spx_getAllGallery };
