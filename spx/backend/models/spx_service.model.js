/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：在线客服数据层（调用七牛云 AI 推理网关，主模型限流时自动切换备用模型）
 */

// 请求一次七牛云对话补全接口，密钥、地址与模型名均来自 backend/.env
async function spx_requestOnce(spx_messages, spx_model) {
  const spx_url = (process.env.QINIU_CUSTOMER_SERVICE_BASE_URL || 'https://api.qnaigc.com/v1') + '/chat/completions';

  const spx_response = await fetch(spx_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.QINIU_CUSTOMER_SERVICE_API_KEY
    },
    body: JSON.stringify({
      model: spx_model,
      messages: spx_messages,
      temperature: 0.5,
      max_tokens: 1024
    }),
    signal: AbortSignal.timeout(30000)
  }).catch(function (spx_err) {
    const spx_netErr = new Error('连接七牛云接口失败：' + spx_err.message);
    spx_netErr.spx_retryable = true;
    throw spx_netErr;
  });

  const spx_data = await spx_response.json();

  if (!spx_response.ok) {
    const spx_reason = (spx_data && spx_data.error && spx_data.error.message) ||
      (spx_data && spx_data.message) || ('HTTP ' + spx_response.status);
    const spx_err = new Error(typeof spx_reason === 'string' ? spx_reason : JSON.stringify(spx_reason));
    // 429 限流、502/503 模型下线或临时不可用：可切换备用模型；其它 5xx 仅重试；401 等鉴权错误直接抛出
    spx_err.spx_status = spx_response.status;
    spx_err.spx_modelUnavailable = [429, 502, 503].indexOf(spx_response.status) !== -1;
    spx_err.spx_retryable = spx_response.status >= 500;
    throw spx_err;
  }

  return {
    reply: spx_data.choices[0].message.content,
    model: spx_data.model,
    usage: spx_data.usage
  };
}

// 单个模型最多尝试 2 次，网络异常 / 上游 5xx 时间隔重试
async function spx_tryModel(spx_model, spx_messages) {
  const spx_maxAttempts = 2;
  let spx_lastErr = null;

  for (let spx_attempt = 1; spx_attempt <= spx_maxAttempts; spx_attempt++) {
    try {
      return await spx_requestOnce(spx_messages, spx_model);
    } catch (spx_err) {
      spx_lastErr = spx_err;
      if (!spx_err.spx_retryable || spx_attempt === spx_maxAttempts) {
        break;
      }
      await new Promise(function (spx_resolve) {
        setTimeout(spx_resolve, 600 * spx_attempt);
      });
    }
  }

  throw spx_lastErr;
}

// 先调用主模型（免费版），被限流或下线时自动切换备用模型
async function spx_serviceReply(spx_messages) {
  const spx_primary = process.env.QINIU_CUSTOMER_SERVICE_MODEL || 'qiniu/conatus-free';
  const spx_fallback = process.env.QINIU_CUSTOMER_SERVICE_FALLBACK_MODEL || 'deepseek/deepseek-v4.1-flash';

  try {
    return await spx_tryModel(spx_primary, spx_messages);
  } catch (spx_err) {
    if (!spx_err.spx_modelUnavailable) {
      throw spx_err;
    }
    console.warn('[在线客服] 主模型 ' + spx_primary + ' 不可用，切换备用模型 ' + spx_fallback + '：' + spx_err.message);
    return await spx_tryModel(spx_fallback, spx_messages);
  }
}

module.exports = { spx_serviceReply };
