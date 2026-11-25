/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：知识库数据层（文件与片段的增删查、基于 BM25 的片段检索）
 */

const spx_mysql = require('mysql2/promise');

const spx_pool = spx_mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// 查询知识库文件列表（按上传时间倒序）
async function spx_listFiles() {
  const [spx_rows] = await spx_pool.query(
    'SELECT id, spx_filename, spx_ext, spx_size, spx_chunk_count, ' +
    "DATE_FORMAT(spx_create_time, '%Y-%m-%d %H:%i') AS spx_create_time " +
    'FROM spx_kb_file ORDER BY spx_create_time DESC, id DESC'
  );
  return spx_rows;
}

// 事务写入文件记录与全部片段，返回新文件 id
async function spx_addFile(spx_file) {
  const spx_conn = await spx_pool.getConnection();
  try {
    await spx_conn.beginTransaction();
    const [spx_result] = await spx_conn.query(
      'INSERT INTO spx_kb_file (spx_filename, spx_ext, spx_size, spx_chunk_count, spx_content) VALUES (?, ?, ?, ?, ?)',
      [spx_file.filename, spx_file.ext, spx_file.size, spx_file.chunks.length, spx_file.content]
    );
    const spx_fileId = spx_result.insertId;
    for (let spx_i = 0; spx_i < spx_file.chunks.length; spx_i += 1) {
      await spx_conn.query(
        'INSERT INTO spx_kb_chunk (spx_file_id, spx_index, spx_content) VALUES (?, ?, ?)',
        [spx_fileId, spx_i + 1, spx_file.chunks[spx_i]]
      );
    }
    await spx_conn.commit();
    return spx_fileId;
  } catch (spx_err) {
    await spx_conn.rollback();
    throw spx_err;
  } finally {
    spx_conn.release();
  }
}

// 删除文件及其全部片段
async function spx_deleteFile(spx_id) {
  await spx_pool.query('DELETE FROM spx_kb_chunk WHERE spx_file_id = ?', [spx_id]);
  const [spx_result] = await spx_pool.query('DELETE FROM spx_kb_file WHERE id = ?', [spx_id]);
  return spx_result.affectedRows;
}

// 读取全部片段（带所属文件名），供检索使用
async function spx_allChunks() {
  const [spx_rows] = await spx_pool.query(
    'SELECT c.id, c.spx_file_id, c.spx_index, c.spx_content, f.spx_filename ' +
    'FROM spx_kb_chunk c JOIN spx_kb_file f ON f.id = c.spx_file_id ' +
    'ORDER BY c.id ASC'
  );
  return spx_rows;
}

// 中文按二元组切词，英文数字按单词切分
function spx_tokenize(spx_text) {
  const spx_tokens = [];
  const spx_lower = String(spx_text).toLowerCase();
  const spx_latin = spx_lower.match(/[a-z0-9]+/g) || [];
  spx_latin.forEach(function (spx_word) { spx_tokens.push(spx_word); });

  const spx_cnParts = spx_lower.match(/[\u4e00-\u9fff]+/g) || [];
  spx_cnParts.forEach(function (spx_part) {
    if (spx_part.length === 1) {
      spx_tokens.push(spx_part);
      return;
    }
    for (let spx_i = 0; spx_i < spx_part.length - 1; spx_i += 1) {
      spx_tokens.push(spx_part.slice(spx_i, spx_i + 2));
    }
  });
  return spx_tokens;
}

/**
 * 检索：BM25 打分（k1=1.5，b=0.75），返回得分最高的片段
 * spx_question 用户问题；spx_topK 返回条数
 */
async function spx_retrieve(spx_question, spx_topK) {
  const spx_chunks = await spx_allChunks();
  if (spx_chunks.length === 0) {
    return [];
  }

  const spx_queryTokens = Array.from(new Set(spx_tokenize(spx_question)));
  const spx_docs = spx_chunks.map(function (spx_chunk) {
    const spx_tokens = spx_tokenize(spx_chunk.spx_filename + ' ' + spx_chunk.spx_content);
    const spx_tf = {};
    spx_tokens.forEach(function (spx_token) {
      spx_tf[spx_token] = (spx_tf[spx_token] || 0) + 1;
    });
    return { spx_chunk: spx_chunk, spx_tf: spx_tf, spx_len: spx_tokens.length };
  });

  const spx_avgLen = spx_docs.reduce(function (spx_sum, spx_doc) { return spx_sum + spx_doc.spx_len; }, 0) / spx_docs.length;
  const spx_k1 = 1.5;
  const spx_b = 0.75;

  const spx_scored = spx_docs.map(function (spx_doc) {
    let spx_score = 0;
    spx_queryTokens.forEach(function (spx_token) {
      const spx_df = spx_docs.filter(function (spx_item) { return spx_item.spx_tf[spx_token]; }).length;
      if (spx_df === 0) {
        return;
      }
      const spx_idf = Math.log((spx_docs.length + 1) / (spx_df + 0.5)) + 1;
      const spx_tf = spx_doc.spx_tf[spx_token] || 0;
      if (spx_tf === 0) {
        return;
      }
      spx_score += spx_idf * (spx_tf * (spx_k1 + 1)) /
        (spx_tf + spx_k1 * (1 - spx_b + spx_b * spx_doc.spx_len / spx_avgLen));
    });
    return {
      spx_file_id: spx_doc.spx_chunk.spx_file_id,
      spx_filename: spx_doc.spx_chunk.spx_filename,
      spx_index: spx_doc.spx_chunk.spx_index,
      spx_content: spx_doc.spx_chunk.spx_content,
      spx_score: Number(spx_score.toFixed(3))
    };
  });

  return spx_scored
    .filter(function (spx_item) { return spx_item.spx_score > 0; })
    .sort(function (spx_a, spx_b2) { return spx_b2.spx_score - spx_a.spx_score; })
    .slice(0, spx_topK || 4);
}

// 统计文件与片段总数，用于页面概览
async function spx_stats() {
  const [spx_fileRows] = await spx_pool.query('SELECT COUNT(*) AS spx_total FROM spx_kb_file');
  const [spx_chunkRows] = await spx_pool.query('SELECT COUNT(*) AS spx_total FROM spx_kb_chunk');
  return { spx_file_count: spx_fileRows[0].spx_total, spx_chunk_count: spx_chunkRows[0].spx_total };
}

module.exports = { spx_listFiles, spx_addFile, spx_deleteFile, spx_retrieve, spx_stats };
