/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：科技新闻数据层（创建连接池，查询新闻列表）
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

// 查询全部新闻，按发布时间倒序返回
async function spx_getAllNews() {
  const [spx_rows] = await spx_pool.query(
    'SELECT id, title, summary, content, source, ' +
    "DATE_FORMAT(publish_time, '%Y-%m-%d %H:%i') AS publish_time, cover_img " +
    'FROM spx_news ORDER BY publish_time DESC, id DESC'
  );
  return spx_rows;
}

module.exports = { spx_getAllNews };
