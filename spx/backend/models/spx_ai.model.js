/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：AI 聊天数据层（调用硅基流动 Chat Completions 接口）
 */

// 请求一次硅基流动的对话补全接口，密钥与模型名均来自 backend/.env
async function spx_requestOnce(spx_messages) {
  const spx_url = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1') + '/chat/completions';

  const spx_response = await fetch(spx_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.SILICONFLOW_API_KEY
    },
    body: JSON.stringify({
      model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
      messages: spx_messages,
      temperature: 0.7,
      max_tokens: 1024
    }),
    signal: AbortSignal.timeout(25000)
  }).catch(function (spx_err) {
    const spx_netErr = new Error('连接硅基流动接口失败：' + spx_err.message);
    spx_netErr.spx_retryable = true;
    throw spx_netErr;
  });

  const spx_data = await spx_response.json();

  if (!spx_response.ok) {
    const spx_reason = (spx_data && (spx_data.message || spx_data.error)) || ('HTTP ' + spx_response.status);
    const spx_err = new Error(typeof spx_reason === 'string' ? spx_reason : JSON.stringify(spx_reason));
    // 上游 5xx（含 50507）属于服务端临时故障，允许重试
    spx_err.spx_retryable = spx_response.status >= 500;
    throw spx_err;
  }

  return {
    reply: spx_data.choices[0].message.content,
    model: spx_data.model,
    usage: spx_data.usage
  };
}

// 上游偶发 5xx，最多尝试 3 次，失败间隔逐次加长
async function spx_chatCompletion(spx_messages) {
  const spx_maxAttempts = 3;
  let spx_lastErr = null;

  for (let spx_attempt = 1; spx_attempt <= spx_maxAttempts; spx_attempt++) {
    try {
      return await spx_requestOnce(spx_messages);
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

module.exports = { spx_chatCompletion };
