/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：科技新闻列表页（fetch 调用 /api/news 并渲染新闻列表）
 */
(function () {
  'use strict';

  // 接口地址：由后端 8405 端口访问时用相对路径；通过 IDE 预览等其它端口打开时直接请求本地后端
  const spx_apiBase = window.location.port === '8405' ? '' : 'http://localhost:8405';
  const spx_apiUrl = spx_apiBase + '/api/news';
  const spx_list = document.getElementById('spx_newsList');
  const spx_status = document.getElementById('spx_newsStatus');
  const spx_count = document.getElementById('spx_newsCount');

  // 顶部展示当前调用的接口地址（相对路径 + 完整地址）
  document.getElementById('spx_apiPath').textContent = 'GET ' + spx_apiUrl;
  document.getElementById('spx_apiFull').textContent =
    spx_apiUrl.indexOf('http') === 0 ? spx_apiUrl : window.location.origin + spx_apiUrl;

  // 显示加载中或错误提示
  function spx_showStatus(spx_text, spx_isError) {
    spx_status.textContent = spx_text;
    spx_status.className = 'spx_status' + (spx_isError ? ' spx_status--error' : '');
  }

  // 创建单条新闻的 DOM 结构
  function spx_createNewsItem(spx_news, spx_index) {
    const spx_item = document.createElement('article');
    spx_item.className = 'spx_news-item';
    spx_item.style.setProperty('--spx_i', spx_index);

    const spx_meta = document.createElement('div');
    spx_meta.className = 'spx_news-meta';

    const spx_source = document.createElement('span');
    spx_source.className = 'spx_news-source';
    spx_source.textContent = spx_news.source || '未知来源';

    const spx_time = document.createElement('time');
    spx_time.textContent = spx_news.publish_time || '';

    const spx_indexText = document.createElement('span');
    spx_indexText.className = 'spx_news-index';
    spx_indexText.textContent = String(spx_index + 1).padStart(2, '0');

    const spx_title = document.createElement('h3');
    spx_title.className = 'spx_news-title';
    spx_title.textContent = spx_news.title || '';

    const spx_summary = document.createElement('p');
    spx_summary.className = 'spx_news-summary';
    spx_summary.textContent = spx_news.summary || '';

    spx_meta.appendChild(spx_source);
    spx_meta.appendChild(spx_time);
    spx_meta.appendChild(spx_indexText);
    spx_item.appendChild(spx_meta);
    spx_item.appendChild(spx_title);
    spx_item.appendChild(spx_summary);
    return spx_item;
  }

  // 渲染新闻列表并更新数量
  function spx_renderNews(spx_newsList) {
    const spx_fragment = document.createDocumentFragment();
    spx_newsList.forEach(function (spx_news, spx_index) {
      spx_fragment.appendChild(spx_createNewsItem(spx_news, spx_index));
    });
    spx_list.appendChild(spx_fragment);
    spx_count.textContent = '共 ' + spx_newsList.length + ' 条新闻';
  }

  // 请求接口获取新闻数据
  async function spx_loadNews() {
    try {
      const spx_response = await fetch(spx_apiUrl);
      const spx_result = await spx_response.json();
      console.log('新闻列表接口返回：', spx_result);

      if (spx_result.code !== 0) {
        spx_showStatus('加载失败：' + spx_result.msg, true);
        console.error('新闻列表加载失败：', spx_result.msg);
        return;
      }

      const spx_newsList = spx_result.data || [];
      spx_status.classList.add('spx_status--hidden');
      spx_renderNews(spx_newsList);
      console.log('新闻条数：', spx_newsList.length);
    } catch (spx_error) {
      spx_showStatus('请求失败：' + spx_error.message + '（请确认后端服务已启动：http://localhost:8405）', true);
      console.error('调用 /api/news 接口失败：', spx_error);
    }
  }

  spx_loadNews();
})();
