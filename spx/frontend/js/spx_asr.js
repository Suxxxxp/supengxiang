/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：语音识别页（麦克风录音 / 上传音频、上传转写、结果展示），并在控制台输出请求与返回数据
 */
(function () {
  'use strict';

  const spx_apiBase = window.location.port === '8405' ? '' : 'http://localhost:8405';
  document.getElementById('spx_apiFull').textContent = (spx_apiBase || window.location.origin) + '/api/asr';

  const spx_recordBtn = document.getElementById('spx_recordBtn');
  const spx_recordText = document.getElementById('spx_recordText');
  const spx_recordTimer = document.getElementById('spx_recordTimer');
  const spx_recordTip = document.getElementById('spx_recordTip');
  const spx_dropZone = document.getElementById('spx_dropZone');
  const spx_fileInput = document.getElementById('spx_fileInput');
  const spx_audioBox = document.getElementById('spx_audioBox');
  const spx_audio = document.getElementById('spx_audio');
  const spx_audioMeta = document.getElementById('spx_audioMeta');
  const spx_asrBtn = document.getElementById('spx_asrBtn');
  const spx_tip = document.getElementById('spx_tip');
  const spx_resultCard = document.getElementById('spx_resultCard');
  const spx_resultText = document.getElementById('spx_resultText');
  const spx_resultMeta = document.getElementById('spx_resultMeta');

  let spx_recorder = null;
  let spx_chunks = [];
  let spx_startTime = 0;
  let spx_timerId = null;
  let spx_audioBlob = null;
  let spx_audioName = '';
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

  // 展示待识别音频
  function spx_showAudio(spx_blob, spx_name) {
    spx_audioBlob = spx_blob;
    spx_audioName = spx_name;
    spx_audio.src = URL.createObjectURL(spx_blob);
    spx_audioMeta.textContent = spx_name + ' · ' + spx_formatSize(spx_blob.size);
    spx_audioBox.hidden = false;
    spx_tip.className = 'spx_tip';
    spx_tip.textContent = '音频已就绪，点击「开始识别」提交给七牛云。';
  }

  // 录音计时
  function spx_tick() {
    const spx_seconds = Math.floor((Date.now() - spx_startTime) / 1000);
    const spx_mm = String(Math.floor(spx_seconds / 60)).padStart(2, '0');
    const spx_ss = String(spx_seconds % 60).padStart(2, '0');
    spx_recordTimer.textContent = spx_mm + ':' + spx_ss;
    if (spx_seconds >= 60) {
      spx_stopRecord();
    }
  }

  // 把浏览器的录音异常翻译成可操作的中文提示
  function spx_micErrorText(spx_error) {
    const spx_map = {
      NotAllowedError: '浏览器或系统拒绝了麦克风权限。请点击地址栏左侧的图标 → 网站设置 → 把「麦克风」改为“允许”，然后刷新页面重试。',
      PermissionDeniedError: '浏览器或系统拒绝了麦克风权限。请点击地址栏左侧的图标 → 网站设置 → 把「麦克风」改为“允许”，然后刷新页面重试。',
      NotFoundError: '没有检测到麦克风设备，请连接麦克风或改用上传音频文件。',
      DevicesNotFoundError: '没有检测到麦克风设备，请连接麦克风或改用上传音频文件。',
      NotReadableError: '麦克风被其他程序占用（如会议、录音软件），请关闭后重试。',
      TrackStartError: '麦克风被其他程序占用（如会议、录音软件），请关闭后重试。',
      OverconstrainedError: '当前麦克风不满足录音参数要求，请更换设备。',
      SecurityError: '当前页面不是安全上下文，请用 http://localhost:8405/asr.html 打开本页（https 或 localhost 才允许录音）。'
    };
    return spx_map[spx_error.name] || spx_error.message;
  }

  // 开始录音
  async function spx_startRecord() {
    if (!window.isSecureContext) {
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '当前页面不是安全上下文，浏览器禁止录音。请访问 http://localhost:8405/asr.html 后重试，或直接上传音频文件。';
      return;
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '当前浏览器不支持录音，请改用上传音频文件。';
      return;
    }
    try {
      const spx_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      spx_chunks = [];
      spx_recorder = new MediaRecorder(spx_stream);
      spx_recorder.ondataavailable = function (spx_event) {
        if (spx_event.data && spx_event.data.size > 0) {
          spx_chunks.push(spx_event.data);
        }
      };
      spx_recorder.onstop = function () {
        spx_stream.getTracks().forEach(function (spx_track) { spx_track.stop(); });
        clearInterval(spx_timerId);
        const spx_type = spx_recorder.mimeType || 'audio/webm';
        const spx_ext = spx_type.indexOf('mp4') !== -1 ? '.m4a' : '.webm';
        const spx_blob = new Blob(spx_chunks, { type: spx_type });
        spx_recordBtn.classList.remove('spx_recording');
        spx_recordText.textContent = '开始录音';
        spx_recordTip.textContent = '录音结束，可试听后识别；最长 60 秒';
        console.log('录音完成：', { type: spx_type, size: spx_blob.size });
        spx_showAudio(spx_blob, '录音' + spx_ext);
      };
      spx_recorder.start();
      spx_startTime = Date.now();
      spx_recordTimer.textContent = '00:00';
      spx_timerId = setInterval(spx_tick, 500);
      spx_recordBtn.classList.add('spx_recording');
      spx_recordText.textContent = '停止录音';
      spx_recordTip.textContent = '正在录音，再次点击停止（最长 60 秒）';
      spx_tip.textContent = '';
    } catch (spx_error) {
      console.error('录音失败：', spx_error.name, spx_error.message);
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '无法录音：' + spx_micErrorText(spx_error) + '（也可以直接上传音频文件识别）';
    }
  }

  // 停止录音
  function spx_stopRecord() {
    if (spx_recorder && spx_recorder.state === 'recording') {
      spx_recorder.stop();
    }
  }

  // 上传音频并识别
  async function spx_recognize() {
    if (!spx_audioBlob || spx_busy) {
      return;
    }
    spx_busy = true;
    spx_asrBtn.disabled = true;
    spx_resultCard.hidden = false;
    spx_resultText.className = 'spx_result spx_result--pending';
    spx_resultText.textContent = '正在识别，请稍候…';
    spx_resultMeta.textContent = '';
    spx_tip.className = 'spx_tip';
    spx_tip.textContent = '正在上传音频并调用七牛云语音识别…';

    const spx_form = new FormData();
    spx_form.append('audio', spx_audioBlob, spx_audioName);
    console.log('发送给后端的数据：', {
      url: spx_apiBase + '/api/asr',
      filename: spx_audioName,
      size: spx_audioBlob.size,
      type: spx_audioBlob.type
    });

    try {
      const spx_response = await fetch(spx_apiBase + '/api/asr', { method: 'POST', body: spx_form });
      const spx_result = await spx_response.json();
      console.log('语音识别接口返回：', spx_result);

      if (spx_result.code !== 0) {
        throw new Error(spx_result.msg);
      }

      console.log('接收自七牛云的数据：', {
        model: spx_result.data.model,
        text: spx_result.data.text,
        usage: spx_result.data.usage
      });

      spx_resultText.className = 'spx_result';
      spx_resultText.textContent = spx_result.data.text || '（未识别到语音内容）';
      const spx_seconds = spx_result.data.usage && spx_result.data.usage.seconds;
      spx_resultMeta.textContent = '模型：' + spx_result.data.model +
        (spx_seconds ? ' · 音频时长 ' + spx_seconds + ' 秒' : '') +
        ' · 共 ' + (spx_result.data.text || '').length + ' 字';
      spx_tip.className = 'spx_tip spx_tip--ok';
      spx_tip.textContent = '识别完成。';
    } catch (spx_error) {
      spx_resultText.className = 'spx_result spx_result--error';
      spx_resultText.textContent = '识别失败：' + spx_error.message +
        '（请确认后端服务已启动：http://localhost:8405）';
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '识别失败，请稍后重试。';
      console.error('语音识别失败：', spx_error);
    } finally {
      spx_busy = false;
      spx_asrBtn.disabled = false;
    }
  }

  // 选择本地音频文件
  function spx_selectFile(spx_file) {
    if (!spx_file) {
      return;
    }
    if (!/\.(wav|mp3|m4a|webm|ogg|amr)$/i.test(spx_file.name)) {
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '仅支持 wav / mp3 / m4a / webm / ogg / amr 音频。';
      return;
    }
    if (spx_file.size > 20 * 1024 * 1024) {
      spx_tip.className = 'spx_tip spx_tip--error';
      spx_tip.textContent = '音频不能超过 20MB。';
      return;
    }
    console.log('已选择音频：', { name: spx_file.name, size: spx_file.size, type: spx_file.type });
    spx_showAudio(spx_file, spx_file.name);
  }

  spx_recordBtn.addEventListener('click', function () {
    if (spx_recorder && spx_recorder.state === 'recording') {
      spx_stopRecord();
    } else {
      spx_startRecord();
    }
  });

  spx_asrBtn.addEventListener('click', spx_recognize);

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
})();
