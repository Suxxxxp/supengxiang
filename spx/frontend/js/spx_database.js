/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：数据库连接测试页交互（提交账号密码到 /api/db-test 并展示结果）
 */
(function () {
  'use strict';

  // 接口地址：由后端 8405 端口访问时用相对路径；通过 IDE 预览等其它端口打开时直接请求本地后端
  const spx_apiBase = window.location.port === '8405' ? '' : 'http://localhost:8405';

  const spx_form = document.getElementById('spx_dbForm');
  const spx_username = document.getElementById('spx_username');
  const spx_password = document.getElementById('spx_password');
  const spx_testBtn = document.getElementById('spx_testBtn');
  const spx_resultBox = document.getElementById('spx_result');

  // 在页面展示测试结果：成功为绿色，失败为红色
  function spx_showResult(spx_text, spx_isSuccess) {
    spx_resultBox.textContent = spx_text;
    spx_resultBox.className = 'spx_result spx_result--show ' +
      (spx_isSuccess ? 'spx_result--ok' : 'spx_result--error');
  }

  // 调用后端 /api/db-test 接口测试数据库连接
  async function spx_testDatabase() {
    spx_testBtn.disabled = true;
    spx_testBtn.textContent = '测试中…';

    try {
      const spx_response = await fetch(spx_apiBase + '/api/db-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: spx_username.value.trim(),
          password: spx_password.value
        })
      });
      const spx_data = await spx_response.json();
      console.log('数据库测试接口返回：', spx_data);

      if (spx_data.code === 0) {
        spx_showResult('数据库连接成功，MySQL 版本：' + spx_data.data.version, true);
        console.log('数据库连接成功，版本：', spx_data.data.version);
      } else {
        spx_showResult('数据库连接失败：' + spx_data.msg, false);
        console.error('数据库连接失败：', spx_data.msg);
      }
    } catch (spx_error) {
      spx_showResult('请求失败：' + spx_error.message + '（请确认后端服务已启动：http://localhost:8405）', false);
      console.error('调用 /api/db-test 接口失败：', spx_error);
    } finally {
      spx_testBtn.disabled = false;
      spx_testBtn.textContent = '测试连接';
    }
  }

  if (spx_form) {
    spx_form.addEventListener('submit', function (spx_event) {
      spx_event.preventDefault();
      spx_testDatabase();
    });
  }
})();
