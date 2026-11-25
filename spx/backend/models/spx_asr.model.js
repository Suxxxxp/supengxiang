/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：语音识别模型层（调用七牛云 Qwen-Audio-3.0-ASR-Flash，音频转文字）
 */

const path = require('path');

const spx_mimeMap = {
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.webm': 'audio/webm',
  '.ogg': 'audio/ogg',
  '.amr': 'audio/amr'
};

/**
 * 调用七牛云音频转写接口
 * spx_audio 音频 Buffer；spx_filename 原始文件名
 * 返回 { text, usage, model }
 */
async function spx_transcribe(spx_audio, spx_filename) {
  const spx_apiKey = process.env.QINIU_ASR_API_KEY || process.env.QINIU_CUSTOMER_SERVICE_API_KEY;
  const spx_baseUrl = process.env.QINIU_ASR_BASE_URL || 'https://api.qnaigc.com/v1';
  const spx_model = process.env.QINIU_ASR_MODEL || 'qwen-audio-3.0-asr-flash';

  if (!spx_apiKey) {
    throw new Error('未配置七牛云 ASR API Key');
  }

  const spx_ext = path.extname(spx_filename).toLowerCase();
  const spx_form = new FormData();
  spx_form.append('model', spx_model);
  spx_form.append('file', new Blob([spx_audio], { type: spx_mimeMap[spx_ext] || 'audio/wav' }), spx_filename);

  const spx_controller = new AbortController();
  const spx_timer = setTimeout(function () { spx_controller.abort(); }, 90000);
  try {
    const spx_response = await fetch(spx_baseUrl + '/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + spx_apiKey },
      body: spx_form,
      signal: spx_controller.signal
    });
    clearTimeout(spx_timer);

    if (!spx_response.ok) {
      const spx_text = await spx_response.text();
      throw new Error('上游接口返回 ' + spx_response.status + '：' + spx_text.slice(0, 200));
    }

    const spx_result = await spx_response.json();
    return {
      text: spx_result.text || '',
      usage: spx_result.usage || null,
      model: spx_model
    };
  } catch (spx_err) {
    clearTimeout(spx_timer);
    if (spx_err.name === 'AbortError') {
      throw new Error('语音识别超时（90 秒）');
    }
    throw spx_err;
  }
}

module.exports = { spx_transcribe, spx_mimeMap };
