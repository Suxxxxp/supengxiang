/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图像识别页（选择/拖拽图片、预览、上传识别），并在控制台输出请求与返回数据
 */
(function () {
  'use strict';

  const spx_apiBase = window.location.port === '8405' ? '' : 'http://localhost:8405';
  document.getElementById('spx_apiFull').textContent = (spx_apiBase || window.location.origin) + '/api/vision';

  const spx_dropZone = document.getElementById('spx_dropZone');
  const spx_fileInput = document.getElementById('spx_fileInput');
  const spx_previewBox = document.getElementById('spx_previewBox');
  const spx_previewImg = document.getElementById('spx_previewImg');
  const spx_previewMeta = document.getElementById('spx_previewMeta');
  const spx_visionBtn = document.getElementById('spx_visionBtn');
  const spx_tip = document.getElementById('spx_tip');
  const spx_resultCard = document.getElementById('spx_resultCard');
  const spx_resultText = document.getElementById('spx_resultText');
  const spx_resultMeta = document.getElementById('spx_resultMeta');

  let spx_selectedFile = null;
  let spx_busy = false;

  // 格式化文件大小
  function spx_formatSize(spx_size) {
    if (spx_size < 1024) {
      return spx_size + ' B';
    }
    if (spx_size < 1024 * 1024) {
      return (spx_size / 1024).toFixed(1) + ' KB';
    }
    return (spx_size / 1024 / 1024).toFixed(2) + ' MB';
  }

  // 选择文件后展示预览
  function spx_selectFile(spx_file) {
    if (!spx_file) {
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(spx_file.type)) {
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '仅支持 jpg / jpeg / png / webp / gif 图片。';
      return;
    }
    if (spx_file.size > 8 * 1024 * 1024) {
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '图片不能超过 8MB，请压缩后再试。';
      return;
    }

    spx_selectedFile = spx_file;
    spx_previewImg.src = URL.createObjectURL(spx_file);
    spx_previewMeta.textContent = spx_file.name + ' · ' + spx_formatSize(spx_file.size);
    spx_previewBox.hidden = false;
    spx_tip.className = 'spx_tip';
    spx_tip.textContent = '图片已就绪，点击「开始识别」提交给大模型。';
    console.log('已选择图片：', { name: spx_file.name, type: spx_file.type, size: spx_file.size });
  }

  // 上传图片并获取描述
  async function spx_recognize() {
    if (!spx_selectedFile || spx_busy) {
      return;
    }
    spx_busy = true;
    spx_visionBtn.disabled = true;
    spx_resultCard.hidden = false;
    spx_resultText.className = 'spx_result spx_result--pending';
    spx_resultText.textContent = '正在识别，请稍候…';
    spx_resultMeta.textContent = '';
    spx_tip.className = 'spx_tip';
    spx_tip.textContent = '正在上传图片并调用多模态模型…';

    const spx_form = new FormData();
    spx_form.append('image', spx_selectedFile);
    console.log('发送给后端的数据：', { url: spx_apiBase + '/api/vision', file: spx_selectedFile.name });

    try {
      const spx_response = await fetch(spx_apiBase + '/api/vision', { method: 'POST', body: spx_form });
      const spx_result = await spx_response.json();
      console.log('图像识别接口返回：', spx_result);

      if (spx_result.code !== 0) {
        throw new Error(spx_result.msg);
      }

      console.log('接收自大模型的数据：', {
        model: spx_result.data.model,
        description: spx_result.data.description,
        usage: spx_result.data.usage
      });

      spx_resultText.className = 'spx_result';
      spx_resultText.textContent = spx_result.data.description;
      spx_resultMeta.textContent = '模型：' + spx_result.data.model +
        (spx_result.data.usage ? ' · token 用量 ' + spx_result.data.usage.total_tokens : '');
      spx_tip.className = 'spx_tip spx_tip--ok';
      spx_tip.textContent = '识别完成。';
    } catch (spx_error) {
      spx_resultText.className = 'spx_result spx_result--error';
      spx_resultText.textContent = '识别失败：' + spx_error.message +
        '（请确认后端服务已启动：http://localhost:8405）';
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '识别失败，请稍后重试。';
      console.error('图像识别失败：', spx_error);
    } finally {
      spx_busy = false;
      spx_visionBtn.disabled = false;
    }
  }

  spx_dropZone.addEventListener('click', function () { spx_fileInput.click(); });
  spx_dropZone.addEventListener('keydown', function (spx_event) {
    if (spx_event.key === 'Enter' || spx_event.key === ' ') {
      spx_event.preventDefault();
      spx_fileInput.click();
    }
  });
  spx_fileInput.addEventListener('change', function () {
    spx_selectFile(spx_fileInput.files[0]);
  });

  ['dragenter', 'dragover'].forEach(function (spx_name) {
    spx_dropZone.addEventListener(spx_name, function (spx_event) {
      spx_event.preventDefault();
      spx_dropZone.classList.add('spx_drop--active');
    });
  });
  ['dragleave', 'drop'].forEach(function (spx_name) {
    spx_dropZone.addEventListener(spx_name, function (spx_event) {
      spx_event.preventDefault();
      spx_dropZone.classList.remove('spx_drop--active');
    });
  });
  spx_dropZone.addEventListener('drop', function (spx_event) {
    spx_selectFile(spx_event.dataTransfer && spx_event.dataTransfer.files[0]);
  });

  spx_visionBtn.addEventListener('click', spx_recognize);
})();
