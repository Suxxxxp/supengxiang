/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：知识库控制层（上传解析、文件管理、基于知识库的 RAG 问答）
 */

const path = require('path');
const spx_kbModel = require('../models/spx_kb.model');
const spx_kbParser = require('../models/spx_kb_parser.model');
const spx_providerModel = require('../models/spx_provider.model');

// RAG 问答人设：只依据检索到的资料回答，资料不足时明确说明
const spx_systemPrompt = [
  '你是「中华美食街」的知识库客服助手。',
  '请严格依据用户消息中提供的【参考资料】回答，不要编造资料之外的信息。',
  '回答时先在句末用 [编号] 标注依据，例如 [1]；资料不足时回答“知识库中暂未找到相关信息”，并建议拨打客服电话 400-800-1234 或留言；若参考资料标注为“知识库中暂无相关片段”，则直接说明未找到，不要添加任何编号。',
  '回答控制在 150 字以内，语气礼貌简洁。'
].join('\n');

// 修复 multipart 文件名编码：浏览器以 UTF-8 发送，multer 默认按 latin1 解析，需转回
function spx_fixFilename(spx_name) {
  const spx_decoded = Buffer.from(spx_name, 'latin1').toString('utf8');
  return spx_decoded.indexOf('\uFFFD') === -1 ? spx_decoded : spx_name;
}

// 上传文件：解析文本 → 切片 → 入库
async function spx_upload(spx_req, spx_res) {
  if (!spx_req.file) {
    spx_res.json({ code: 400, msg: '请选择要上传的文件（字段名 file）', data: null });
    return;
  }

  const spx_filename = spx_fixFilename(spx_req.file.originalname);
  const spx_ext = path.extname(spx_filename).toLowerCase();
  try {
    const spx_text = await spx_kbParser.spx_parseFile(spx_filename, spx_req.file.buffer);
    const spx_chunks = spx_kbParser.spx_chunkText(spx_text, 220, 50);

    if (!spx_text.trim() || spx_chunks.length === 0) {
      spx_res.json({ code: 400, msg: '文件解析后没有可用文字，请检查文件内容是否为扫描件或空文档', data: null });
      return;
    }

    const spx_fileId = await spx_kbModel.spx_addFile({
      filename: spx_filename,
      ext: spx_ext,
      size: spx_req.file.size,
      content: spx_text,
      chunks: spx_chunks
    });

    console.log('[知识库上传]', spx_filename, '解析字数：', spx_text.length, '切片数：', spx_chunks.length);

    spx_res.json({
      code: 0,
      msg: '知识库文件上传成功',
      data: {
        id: spx_fileId,
        filename: spx_filename,
        ext: spx_ext,
        size: spx_req.file.size,
        char_count: spx_text.length,
        chunk_count: spx_chunks.length
      }
    });
  } catch (spx_err) {
    console.error('[知识库上传失败]', spx_filename, spx_err.message);
    spx_res.json({ code: 500, msg: '文件解析失败：' + spx_err.message, data: null });
  }
}

// 知识库文件列表
async function spx_files(spx_req, spx_res) {
  try {
    const spx_rows = await spx_kbModel.spx_listFiles();
    const spx_count = await spx_kbModel.spx_stats();
    spx_res.json({
      code: 0,
      msg: '获取知识库文件列表成功',
      data: { files: spx_rows, stats: spx_count }
    });
  } catch (spx_err) {
    spx_res.json({ code: 500, msg: '获取文件列表失败：' + spx_err.message, data: null });
  }
}

// 删除知识库文件（同步删除片段）
async function spx_delete(spx_req, spx_res) {
  const spx_id = Number(spx_req.params.id);
  if (!Number.isInteger(spx_id) || spx_id <= 0) {
    spx_res.json({ code: 400, msg: '文件 id 不合法', data: null });
    return;
  }
  try {
    const spx_affected = await spx_kbModel.spx_deleteFile(spx_id);
    if (spx_affected === 0) {
      spx_res.json({ code: 404, msg: '文件不存在或已删除', data: null });
      return;
    }
    spx_res.json({ code: 0, msg: '文件已从知识库删除', data: { id: spx_id } });
  } catch (spx_err) {
    spx_res.json({ code: 500, msg: '删除失败：' + spx_err.message, data: null });
  }
}

/**
 * POST /api/kb/ask
 * 请求体：{ question: '你们几点营业？', provider?: 'siliconflow' | 'qiniu' }
 * 流程：检索片段 → 拼接参考资料 → 调用大模型 → 返回回答与引用
 */
async function spx_ask(spx_req, spx_res) {
  const spx_question = spx_req.body && String(spx_req.body.question || '').trim();
  const spx_providers = spx_providerModel.spx_providerList().map(function (spx_item) { return spx_item.id; });
  const spx_provider = (spx_req.body && spx_req.body.provider) || process.env.AI_PROVIDER || 'siliconflow';

  if (!spx_question || spx_question.length < 2 || spx_question.length > 500) {
    spx_res.json({ code: 400, msg: '问题长度需在 2~500 字之间', data: null });
    return;
  }
  if (spx_providers.indexOf(spx_provider) === -1) {
    spx_res.json({ code: 400, msg: '不支持的模型平台：' + spx_provider, data: null });
    return;
  }

  try {
    const spx_refs = await spx_kbModel.spx_retrieve(spx_question, 4);
    const spx_context = spx_refs.length === 0
      ? '（知识库中暂无相关片段）'
      : spx_refs.map(function (spx_item, spx_index) {
        return '[' + (spx_index + 1) + ']（来源：' + spx_item.spx_filename + ' 第 ' + spx_item.spx_index + ' 段）\n' + spx_item.spx_content;
      }).join('\n\n');

    const spx_messages = [
      { role: 'system', content: spx_systemPrompt },
      { role: 'user', content: '【参考资料】\n' + spx_context + '\n\n【用户问题】\n' + spx_question }
    ];

    // 控制台输出发送给大模型的数据
    console.log('[知识库问答] 发送给大模型的数据：', JSON.stringify(spx_messages, null, 2));

    const spx_result = await spx_providerModel.spx_chatByProvider(spx_provider, spx_messages);

    // 控制台输出接收自大模型的数据
    console.log('[知识库问答] 接收自大模型的数据：', JSON.stringify(spx_result, null, 2));

    // 无检索结果时去掉模型自作主张添加的引用编号
    const spx_answer = spx_refs.length === 0
      ? spx_result.reply.replace(/\[\d+\]/g, '').trim()
      : spx_result.reply;

    spx_res.json({
      code: 0,
      msg: '知识库问答成功',
      data: {
        answer: spx_answer,
        references: spx_refs,
        model: spx_result.model,
        usage: spx_result.usage,
        provider: spx_provider,
        request_messages: spx_messages
      }
    });
  } catch (spx_err) {
    spx_res.json({ code: 500, msg: '知识库问答失败：' + spx_err.message, data: null });
  }
}

module.exports = { spx_upload, spx_files, spx_delete, spx_ask };
