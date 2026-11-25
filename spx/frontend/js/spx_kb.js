/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：知识库问答页（文件上传、删除、RAG 提问），并在控制台输出发送/接收大模型的数据
 */
(function () {
  'use strict';

  const spx_apiBase = window.location.port === '8405' ? '' : 'http://localhost:8405';
  const spx_apiFull = spx_apiBase || window.location.origin;
  document.getElementById('spx_apiFull').textContent = spx_apiFull + '/api/kb/ask';

  const spx_dropZone = document.getElementById('spx_dropZone');
  const spx_fileInput = document.getElementById('spx_fileInput');
  const spx_uploadTip = document.getElementById('spx_uploadTip');
  const spx_fileList = document.getElementById('spx_fileList');
  const spx_stats = document.getElementById('spx_stats');
  const spx_question = document.getElementById('spx_question');
  const spx_askBtn = document.getElementById('spx_askBtn');
  const spx_answer = document.getElementById('spx_answer');
  const spx_answerText = document.getElementById('spx_answerText');
  const spx_answerMeta = document.getElementById('spx_answerMeta');
  const spx_refs = document.getElementById('spx_refs');
  const spx_provider = document.getElementById('spx_providerSelect');

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

  // 加载模型平台列表并填充下拉框
  async function spx_loadProviders() {
    try {
      const spx_response = await fetch(spx_apiBase + '/api/chat/providers');
      const spx_result = await spx_response.json();
      console.log('模型平台列表：', spx_result);
      if (spx_result.code !== 0) {
        return;
      }
      spx_provider.innerHTML = '';
      spx_result.data.providers.forEach(function (spx_item) {
        const spx_option = document.createElement('option');
        spx_option.value = spx_item.id;
        spx_option.textContent = spx_item.name + (spx_item.available ? '' : '（未配置 Key）');
        spx_option.disabled = !spx_item.available;
        spx_provider.appendChild(spx_option);
      });
      spx_provider.value = spx_result.data.default;
    } catch (spx_error) {
      console.error('获取模型平台列表失败：', spx_error);
    }
  }

  // 加载知识库文件列表与统计
  async function spx_loadFiles() {
    try {
      const spx_response = await fetch(spx_apiBase + '/api/kb/files');
      const spx_result = await spx_response.json();
      console.log('知识库文件列表：', spx_result);
      if (spx_result.code !== 0) {
        throw new Error(spx_result.msg);
      }

      const spx_files = spx_result.data.files;
      spx_stats.textContent = '文件 ' + spx_result.data.stats.spx_file_count + ' 个 · 片段 ' +
        spx_result.data.stats.spx_chunk_count + ' 条';
      spx_fileList.innerHTML = '';

      if (spx_files.length === 0) {
        const spx_empty = document.createElement('li');
        spx_empty.className = 'spx_file-empty';
        spx_empty.textContent = '知识库还是空的，先上传一份门店文档吧。';
        spx_fileList.appendChild(spx_empty);
        return;
      }

      spx_files.forEach(function (spx_file) {
        const spx_item = document.createElement('li');
        spx_item.className = 'spx_file-item';

        const spx_info = document.createElement('div');
        const spx_name = document.createElement('p');
        spx_name.className = 'spx_file-name';
        spx_name.textContent = spx_file.spx_filename;
        const spx_meta = document.createElement('p');
        spx_meta.className = 'spx_file-meta';
        spx_meta.textContent = spx_file.spx_ext + ' · ' + spx_formatSize(spx_file.spx_size) +
          ' · ' + spx_file.spx_chunk_count + ' 个片段 · ' + spx_file.spx_create_time;
        spx_info.appendChild(spx_name);
        spx_info.appendChild(spx_meta);

        const spx_del = document.createElement('button');
        spx_del.className = 'spx_file-del';
        spx_del.type = 'button';
        spx_del.textContent = '删除';
        spx_del.addEventListener('click', function () {
          spx_deleteFile(spx_file.id, spx_file.spx_filename);
        });

        spx_item.appendChild(spx_info);
        spx_item.appendChild(spx_del);
        spx_fileList.appendChild(spx_item);
      });
    } catch (spx_error) {
      console.error('加载知识库列表失败：', spx_error);
      spx_uploadTip.className = 'spx_upload-tip spx_upload-tip--error';
      spx_uploadTip.textContent = '加载知识库失败：' + spx_error.message;
    }
  }

  // 上传文件到知识库
  async function spx_uploadFile(spx_file) {
    if (!spx_file || spx_busy) {
      return;
    }
    spx_busy = true;
    spx_uploadTip.className = 'spx_upload-tip';
    spx_uploadTip.textContent = '正在上传并解析「' + spx_file.name + '」…';

    const spx_form = new FormData();
    spx_form.append('file', spx_file);

    try {
      const spx_response = await fetch(spx_apiBase + '/api/kb/upload', { method: 'POST', body: spx_form });
      const spx_result = await spx_response.json();
      console.log('上传接口返回：', spx_result);

      if (spx_result.code !== 0) {
        throw new Error(spx_result.msg);
      }
      spx_uploadTip.className = 'spx_upload-tip spx_upload-tip--ok';
      spx_uploadTip.textContent = '「' + spx_result.data.filename + '」已入库：解析 ' +
        spx_result.data.char_count + ' 字，切分 ' + spx_result.data.chunk_count + ' 个片段。';
      await spx_loadFiles();
    } catch (spx_error) {
      spx_uploadTip.className = 'spx_upload-tip spx_upload-tip--error';
      spx_uploadTip.textContent = '上传失败：' + spx_error.message;
      console.error('知识库上传失败：', spx_error);
    } finally {
      spx_busy = false;
      spx_fileInput.value = '';
    }
  }

  // 删除知识库文件
  async function spx_deleteFile(spx_id, spx_filename) {
    if (!window.confirm('确认从知识库删除「' + spx_filename + '」及其全部片段？')) {
      return;
    }
    try {
      const spx_response = await fetch(spx_apiBase + '/api/kb/files/' + spx_id, { method: 'DELETE' });
      const spx_result = await spx_response.json();
      console.log('删除接口返回：', spx_result);
      if (spx_result.code !== 0) {
        throw new Error(spx_result.msg);
      }
      spx_uploadTip.className = 'spx_upload-tip spx_upload-tip--ok';
      spx_uploadTip.textContent = '已删除「' + spx_filename + '」。';
      await spx_loadFiles();
    } catch (spx_error) {
      spx_uploadTip.className = 'spx_upload-tip spx_upload-tip--error';
      spx_uploadTip.textContent = '删除失败：' + spx_error.message;
      console.error('删除知识库文件失败：', spx_error);
    }
  }

  // 渲染参考片段
  function spx_renderRefs(spx_refList) {
    spx_refs.innerHTML = '';
    if (!spx_refList || spx_refList.length === 0) {
      return;
    }
    const spx_title = document.createElement('p');
    spx_title.className = 'spx_ref-title';
    spx_title.textContent = '检索到的参考资料（' + spx_refList.length + ' 条）';
    spx_refs.appendChild(spx_title);

    spx_refList.forEach(function (spx_ref, spx_index) {
      const spx_item = document.createElement('div');
      spx_item.className = 'spx_ref-item';
      const spx_head = document.createElement('p');
      spx_head.className = 'spx_ref-head';
      spx_head.textContent = '[' + (spx_index + 1) + '] ' + spx_ref.spx_filename +
        ' · 第 ' + spx_ref.spx_index + ' 段 · 相关度 ' + spx_ref.spx_score;
      const spx_body = document.createElement('p');
      spx_body.textContent = spx_ref.spx_content.length > 160
        ? spx_ref.spx_content.slice(0, 160) + '…'
        : spx_ref.spx_content;
      spx_item.appendChild(spx_head);
      spx_item.appendChild(spx_body);
      spx_refs.appendChild(spx_item);
    });
  }

  // 基于知识库提问
  async function spx_ask() {
    const spx_text = spx_question.value.trim();
    if (!spx_text || spx_busy) {
      return;
    }

    spx_busy = true;
    spx_askBtn.disabled = true;
    spx_answer.hidden = false;
    spx_answerText.className = 'spx_answer-text';
    spx_answerText.textContent = '正在检索知识库并请求大模型…';
    spx_answerMeta.textContent = '';
    spx_refs.innerHTML = '';

    const spx_payload = { question: spx_text, provider: spx_provider.value };
    console.log('发送给后端的数据：', spx_payload);

    try {
      const spx_response = await fetch(spx_apiBase + '/api/kb/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spx_payload)
      });
      const spx_result = await spx_response.json();
      console.log('知识库问答接口返回：', spx_result);

      if (spx_result.code !== 0) {
        throw new Error(spx_result.msg);
      }

      // 控制台输出真正发送给大模型的数据与接收到的数据
      console.log('发送给大模型的数据：', spx_result.data.request_messages);
      console.log('接收自大模型的数据：', {
        provider: spx_result.data.provider,
        model: spx_result.data.model,
        answer: spx_result.data.answer,
        usage: spx_result.data.usage
      });

      spx_answerText.textContent = spx_result.data.answer;
      spx_answerMeta.textContent = '模型：' + spx_result.data.model +
        ' · 引用 ' + spx_result.data.references.length + ' 条资料';
      spx_renderRefs(spx_result.data.references);
    } catch (spx_error) {
      spx_answerText.className = 'spx_answer-text spx_answer-text--error';
      spx_answerText.textContent = '提问失败：' + spx_error.message +
        '（请确认后端服务已启动：http://localhost:8405）';
      console.error('知识库问答失败：', spx_error);
    } finally {
      spx_busy = false;
      spx_askBtn.disabled = false;
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
    spx_uploadFile(spx_fileInput.files[0]);
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
    const spx_file = spx_event.dataTransfer && spx_event.dataTransfer.files[0];
    spx_uploadFile(spx_file);
  });

  spx_askBtn.addEventListener('click', spx_ask);
  spx_question.addEventListener('keydown', function (spx_event) {
    if (spx_event.key === 'Enter') {
      spx_event.preventDefault();
      spx_ask();
    }
  });

  document.getElementById('spx_quickList').addEventListener('click', function (spx_event) {
    const spx_btn = spx_event.target.closest('.spx_quick-item');
    if (!spx_btn || spx_busy) {
      return;
    }
    spx_question.value = spx_btn.textContent.trim();
    spx_ask();
  });

  spx_loadProviders();
  spx_loadFiles();
})();
