/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：在线客服接口的控制层（校验消息并返回客服回复）
 */

const spx_providerModel = require('../models/spx_provider.model');

// 客服人设：介绍本站页面与功能，回答保持简洁礼貌
const spx_systemPrompt = [
  '你是「宿鹏翔个人作品集网站」的在线客服助手，语气礼貌、简洁、专业。',
  '网站页面包括：首页（页面导航）、科技新闻（/api/news 接口）、图文列表（/api/gallery 接口）、',
  '数据库连接测试（/api/db-test 接口）、AI 聊天（/api/chat 接口）、在线客服（本页）。',
  '网站技术栈：前端原生 HTML/CSS/JavaScript，后端 Node.js + Express（端口 8405），数据库 MySQL，',
  '大模型能力由硅基流动与七牛云提供。',
  '回答控制在 120 字以内；遇到与网站无关的问题，礼貌说明你只负责本站客服咨询。'
].join('\n');

// 校验请求中的对话消息格式，合法返回 true
function spx_isValidMessages(spx_messages) {
  if (!Array.isArray(spx_messages) || spx_messages.length === 0 || spx_messages.length > 20) {
    return false;
  }
  return spx_messages.every(function (spx_item) {
    return spx_item &&
      ['user', 'assistant'].indexOf(spx_item.role) !== -1 &&
      typeof spx_item.content === 'string' &&
      spx_item.content.trim() !== '' &&
      spx_item.content.length <= 1000;
  });
}

/**
 * POST /api/service
 * 请求体：{ provider?: 'siliconflow' | 'qiniu', messages: [{ role: 'user', content: '网站有哪些页面？' }] }
 */
async function spx_service(spx_req, spx_res) {
  const spx_messages = spx_req.body && spx_req.body.messages;
  const spx_providers = spx_providerModel.spx_providerList().map(function (spx_item) { return spx_item.id; });
  const spx_provider = (spx_req.body && spx_req.body.provider) || process.env.AI_PROVIDER || 'siliconflow';

  if (!spx_isValidMessages(spx_messages)) {
    spx_res.json({ code: 400, msg: '消息格式不正确：messages 需为 1~20 条、包含 role 与 content 的对象数组', data: null });
    return;
  }

  if (spx_providers.indexOf(spx_provider) === -1) {
    spx_res.json({ code: 400, msg: '不支持的模型平台：' + spx_provider, data: null });
    return;
  }

  try {
    const spx_result = await spx_providerModel.spx_chatByProvider(spx_provider, [
      { role: 'system', content: spx_systemPrompt }
    ].concat(spx_messages));
    spx_res.json({
      code: 0,
      msg: '客服回复成功',
      data: spx_result
    });
  } catch (spx_err) {
    spx_res.json({
      code: 500,
      msg: '客服回复失败：' + spx_err.message,
      data: null
    });
  }
}

module.exports = { spx_service };
