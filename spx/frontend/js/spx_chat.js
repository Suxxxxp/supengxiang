/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：AI 聊天页（调用 /api/chat，维护多轮对话并渲染气泡）
 */
(function () {
  'use strict';

  // 接口地址：由后端 8405 端口访问时用相对路径；通过 IDE 预览等其它端口打开时直接请求本地后端
  const spx_apiBase = window.location.port === '8405' ? '' : 'http://localhost:8405';
  const spx_apiUrl = spx_apiBase + '/api/chat';

  const spx_list = document.getElementById('spx_chatList');
  const spx_form = document.getElementById('spx_chatForm');
  const spx_input = document.getElementById('spx_chatInput');
  const spx_sendBtn = document.getElementById('spx_sendBtn');
  const spx_select = document.getElementById('spx_providerSelect');

  // 对话历史（发给后端的 messages），客服人设由后端统一附加，前端不可篡改
  const spx_history = [];
  let spx_pending = false;

  // 顶部展示当前调用的接口地址
  document.getElementById('spx_apiPath').textContent = 'POST ' + spx_apiUrl;
  document.getElementById('spx_apiFull').textContent =
    spx_apiUrl.indexOf('http') === 0 ? spx_apiUrl : window.location.origin + spx_apiUrl;

  // 在聊天区域追加一条消息气泡，返回气泡元素
  function spx_appendMessage(spx_role, spx_text, spx_extraClass) {
    const spx_msg = document.createElement('div');
    spx_msg.className = 'spx_msg spx_msg--' + spx_role + (spx_extraClass ? ' ' + spx_extraClass : '');
    spx_msg.textContent = spx_text;
    spx_list.appendChild(spx_msg);
    spx_list.scrollTop = spx_list.scrollHeight;
    return spx_msg;
  }

  // 自动调整输入框高度，最高不超过样式限制
  function spx_resizeInput() {
    spx_input.style.height = 'auto';
    spx_input.style.height = Math.min(spx_input.scrollHeight, 132) + 'px';
  }

  // 发送当前输入内容并等待 AI 回复
  async function spx_sendMessage() {
    const spx_text = spx_input.value.trim();
    if (!spx_text || spx_pending) {
      return;
    }

    spx_history.push({ role: 'user', content: spx_text });
    spx_appendMessage('user', spx_text);
    spx_input.value = '';
    spx_resizeInput();

    spx_pending = true;
    spx_sendBtn.disabled = true;
    const spx_pendingMsg = spx_appendMessage('assistant', '正在思考…', 'spx_msg--pending');
    const spx_provider = spx_select.value;

    try {
      const spx_response = await fetch(spx_apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: spx_provider, messages: spx_history })
      });
      const spx_result = await spx_response.json();
      console.log('AI 聊天接口返回：', spx_result);

      if (spx_result.code === 0) {
        spx_pendingMsg.classList.remove('spx_msg--pending');
        spx_pendingMsg.textContent = spx_result.data.reply;
        spx_history.push({ role: 'assistant', content: spx_result.data.reply });
        console.log('当前模型：', spx_result.data.model, '消耗 tokens：', spx_result.data.usage);
      } else {
        spx_pendingMsg.classList.remove('spx_msg--pending');
        spx_pendingMsg.classList.add('spx_msg--error');
        spx_pendingMsg.textContent = spx_result.msg;
        spx_history.pop();
        console.error('AI 回复失败：', spx_result.msg);
      }
    } catch (spx_error) {
      spx_pendingMsg.classList.remove('spx_msg--pending');
      spx_pendingMsg.classList.add('spx_msg--error');
      spx_pendingMsg.textContent = '请求失败：' + spx_error.message +
        '（请确认后端服务已启动：http://localhost:8405）';
      spx_history.pop();
      console.error('调用 /api/chat 接口失败：', spx_error);
    } finally {
      spx_pending = false;
      spx_sendBtn.disabled = false;
      spx_list.scrollTop = spx_list.scrollHeight;
      spx_input.focus();
    }
  }

  spx_form.addEventListener('submit', function (spx_event) {
    spx_event.preventDefault();
    spx_sendMessage();
  });

  // Enter 发送，Shift + Enter 换行
  spx_input.addEventListener('keydown', function (spx_event) {
    if (spx_event.key === 'Enter' && !spx_event.shiftKey) {
      spx_event.preventDefault();
      spx_sendMessage();
    }
  });

  spx_input.addEventListener('input', spx_resizeInput);

  // 从后端读取可切换的模型平台，填充下拉框
  async function spx_loadProviders() {
    try {
      const spx_response = await fetch(spx_apiBase + '/api/chat/providers');
      const spx_result = await spx_response.json();
      console.log('模型平台列表：', spx_result);
      if (spx_result.code !== 0) {
        return;
      }
      spx_select.innerHTML = '';
      spx_result.data.providers.forEach(function (spx_item) {
        const spx_option = document.createElement('option');
        spx_option.value = spx_item.id;
        spx_option.textContent = spx_item.name + (spx_item.available ? '' : '（未配置 Key）');
        spx_option.disabled = !spx_item.available;
        spx_select.appendChild(spx_option);
      });
      spx_select.value = spx_result.data.default;
    } catch (spx_error) {
      console.error('获取模型平台列表失败：', spx_error);
    }
  }

  spx_loadProviders();
})();
