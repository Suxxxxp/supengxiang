/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图像识别模型层（调用硅基流动多模态模型，传入 base64 图片并返回描述）
 */

// 调用视觉模型，spx_imageUrl 为 data:image/xxx;base64,...；spx_prompt 为识别指令
async function spx_describeImage(spx_imageUrl, spx_prompt) {
  const spx_apiKey = process.env.SILICONFLOW_API_KEY;
  const spx_baseUrl = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
  const spx_model = process.env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct';

  if (!spx_apiKey) {
    throw new Error('未配置 SILICONFLOW_API_KEY');
  }

  const spx_body = {
    model: spx_model,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: spx_prompt },
        { type: 'image_url', image_url: { url: spx_imageUrl } }
      ]
    }],
    max_tokens: 400,
    temperature: 0.3
  };

  let spx_lastError = null;
  for (let spx_attempt = 1; spx_attempt <= 2; spx_attempt += 1) {
    const spx_controller = new AbortController();
    const spx_timer = setTimeout(function () { spx_controller.abort(); }, 60000);
    try {
      const spx_response = await fetch(spx_baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + spx_apiKey
        },
        body: JSON.stringify(spx_body),
        signal: spx_controller.signal
      });
      clearTimeout(spx_timer);

      if (!spx_response.ok) {
        const spx_text = await spx_response.text();
        spx_lastError = new Error('上游接口返回 ' + spx_response.status + '：' + spx_text.slice(0, 200));
        if (spx_response.status >= 500 && spx_attempt === 1) {
          continue;
        }
        throw spx_lastError;
      }

      const spx_result = await spx_response.json();
      const spx_message = spx_result.choices && spx_result.choices[0] && spx_result.choices[0].message;
      return {
        reply: spx_message ? spx_message.content : '',
        model: spx_result.model || spx_model,
        usage: spx_result.usage || null
      };
    } catch (spx_err) {
      clearTimeout(spx_timer);
      spx_lastError = spx_err.name === 'AbortError' ? new Error('请求超时（60 秒）') : spx_err;
      if (spx_attempt === 2) {
        break;
      }
    }
  }
  throw spx_lastError;
}

module.exports = { spx_describeImage };
