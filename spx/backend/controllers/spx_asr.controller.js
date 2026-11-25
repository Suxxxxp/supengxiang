/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：语音识别控制层（接收音频，返回转写文字）
 */

const spx_asrModel = require('../models/spx_asr.model');

/**
 * POST /api/asr
 * 请求：multipart/form-data，字段名 audio
 * 返回：{ code, msg, data: { text, model, usage, seconds } }
 */
async function spx_asr(spx_req, spx_res) {
  if (!spx_req.file) {
    spx_res.json({ code: 400, msg: '请上传音频文件（字段名 audio）', data: null });
    return;
  }

  // 修复中文文件名编码
  const spx_decoded = Buffer.from(spx_req.file.originalname, 'latin1').toString('utf8');
  const spx_filename = spx_decoded.indexOf('\uFFFD') === -1 ? spx_decoded : spx_req.file.originalname;

  try {
    console.log('[语音识别] 发送给七牛云的数据：', JSON.stringify({
      model: process.env.QINIU_ASR_MODEL || 'qwen-audio-3.0-asr-flash',
      filename: spx_filename,
      mimetype: spx_req.file.mimetype,
      size: spx_req.file.size
    }, null, 2));

    const spx_result = await spx_asrModel.spx_transcribe(spx_req.file.buffer, spx_filename);

    console.log('[语音识别] 接收自七牛云的数据：', JSON.stringify(spx_result, null, 2));

    spx_res.json({
      code: 0,
      msg: '语音识别成功',
      data: {
        text: spx_result.text,
        model: spx_result.model,
        usage: spx_result.usage,
        filename: spx_filename,
        size: spx_req.file.size
      }
    });
  } catch (spx_err) {
    spx_res.json({ code: 500, msg: '语音识别失败：' + spx_err.message, data: null });
  }
}

module.exports = { spx_asr };
