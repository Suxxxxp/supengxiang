/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图像识别控制层（接收图片，返回多模态模型生成的图片描述）
 */

const spx_visionModel = require('../models/spx_vision.model');

// 扩展名与 MIME 类型映射
const spx_mimeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

// 识别指令：要求客观描述，避免编造
const spx_prompt = [
  '请用中文描述这张图片，依次说明：主体内容、场景环境、主要颜色与构图、图片中出现的文字（如有）。',
  '只描述图片中真实可见的信息，不要编造，总字数控制在 200 字以内。'
].join('');

/**
 * POST /api/vision
 * 请求：multipart/form-data，字段名 image
 * 返回：{ code, msg, data: { description, model, usage } }
 */
async function spx_vision(spx_req, spx_res) {
  if (!spx_req.file) {
    spx_res.json({ code: 400, msg: '请选择要识别的图片（字段名 image）', data: null });
    return;
  }

  const spx_ext = (spx_req.file.originalname.match(/\.[^.]+$/) || [''])[0].toLowerCase();
  const spx_mime = spx_mimeMap[spx_ext];
  if (!spx_mime) {
    spx_res.json({ code: 400, msg: '不支持的图片格式：' + spx_ext, data: null });
    return;
  }

  const spx_imageUrl = 'data:' + spx_mime + ';base64,' + spx_req.file.buffer.toString('base64');

  try {
    // 控制台输出发送给大模型的数据（base64 只打印前缀，避免刷屏）
    console.log('[图像识别] 发送给大模型的数据：', JSON.stringify({
      model: process.env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct',
      filename: spx_req.file.originalname,
      size: spx_req.file.size,
      image_url_prefix: spx_imageUrl.slice(0, 60) + '...(base64 已省略)',
      prompt: spx_prompt
    }, null, 2));

    const spx_result = await spx_visionModel.spx_describeImage(spx_imageUrl, spx_prompt);

    console.log('[图像识别] 接收自大模型的数据：', JSON.stringify(spx_result, null, 2));

    spx_res.json({
      code: 0,
      msg: '图像识别成功',
      data: {
        description: spx_result.reply,
        model: spx_result.model,
        usage: spx_result.usage
      }
    });
  } catch (spx_err) {
    spx_res.json({ code: 500, msg: '图像识别失败：' + spx_err.message, data: null });
  }
}

module.exports = { spx_vision };
