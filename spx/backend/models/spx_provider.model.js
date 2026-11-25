/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：模型平台配置与分发（硅基流动 / 七牛云），业务层只需传平台 id 与 messages
 */

const spx_aiModel = require('./spx_ai.model');
const spx_serviceModel = require('./spx_service.model');

// 返回可切换的模型平台列表，名称与可用性均取自 .env
function spx_providerList() {
  return [
    {
      id: 'siliconflow',
      name: '硅基流动 · ' + (process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct'),
      available: !!process.env.SILICONFLOW_API_KEY
    },
    {
      id: 'qiniu',
      name: '七牛云 · ' + (process.env.QINIU_CUSTOMER_SERVICE_MODEL || 'qiniu/conatus-free'),
      available: !!process.env.QINIU_CUSTOMER_SERVICE_API_KEY
    }
  ];
}

// 按平台 id 把对话分发给对应的模型实现
function spx_chatByProvider(spx_provider, spx_messages) {
  return spx_provider === 'qiniu'
    ? spx_serviceModel.spx_serviceReply(spx_messages)
    : spx_aiModel.spx_chatCompletion(spx_messages);
}

module.exports = { spx_providerList, spx_chatByProvider };
