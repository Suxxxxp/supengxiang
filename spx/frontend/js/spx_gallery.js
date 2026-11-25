/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：图文列表页（fetch 调用 /api/gallery，网格渲染上图下文卡片）
 */
(function () {
  'use strict';

  // 接口地址：由后端 8405 端口访问时用相对路径；通过 IDE 预览等其它端口打开时直接请求本地后端
  const spx_apiBase = window.location.port === '8405' ? '' : 'http://localhost:8405';
  const spx_apiUrl = spx_apiBase + '/api/gallery';
  const spx_grid = document.getElementById('spx_galleryList');
  const spx_status = document.getElementById('spx_galleryStatus');
  const spx_count = document.getElementById('spx_galleryCount');

  // 顶部展示当前调用的接口地址（相对路径 + 完整地址）
  document.getElementById('spx_apiPath').textContent = 'GET ' + spx_apiUrl;
  document.getElementById('spx_apiFull').textContent =
    spx_apiUrl.indexOf('http') === 0 ? spx_apiUrl : window.location.origin + spx_apiUrl;

  // 显示加载中或错误提示
  function spx_showStatus(spx_text, spx_isError) {
    spx_status.textContent = spx_text;
    spx_status.className = 'spx_status' + (spx_isError ? ' spx_status--error' : '');
  }

  // 创建单条图文卡片（上图下文，图片失败时切换为占位色块）
  function spx_createCard(spx_item, spx_index) {
    const spx_card = document.createElement('article');
    spx_card.className = 'spx_card';
    spx_card.style.setProperty('--spx_i', spx_index);

    const spx_thumb = document.createElement('div');
    spx_thumb.className = 'spx_card-thumb';

    const spx_placeholder = document.createElement('div');
    spx_placeholder.className = 'spx_card-placeholder';
    spx_placeholder.textContent = spx_item.category || '暂无图片';

    const spx_img = document.createElement('img');
    spx_img.src = spx_item.img_url || '';
    spx_img.alt = spx_item.title || '图文图片';
    spx_img.loading = 'lazy';
    spx_img.addEventListener('error', function () {
      spx_thumb.classList.add('spx_card-thumb--fallback');
      console.warn('图片加载失败，已显示占位色块：', spx_item.img_url);
    });

    const spx_body = document.createElement('div');
    spx_body.className = 'spx_card-body';

    const spx_cat = document.createElement('span');
    spx_cat.className = 'spx_card-cat';
    spx_cat.textContent = spx_item.category || '未分类';

    const spx_title = document.createElement('h3');
    spx_title.className = 'spx_card-title';
    spx_title.textContent = spx_item.title || '';

    const spx_desc = document.createElement('p');
    spx_desc.className = 'spx_card-desc';
    spx_desc.textContent = spx_item.description || '';

    spx_thumb.appendChild(spx_placeholder);
    spx_thumb.appendChild(spx_img);
    spx_body.appendChild(spx_cat);
    spx_body.appendChild(spx_title);
    spx_body.appendChild(spx_desc);
    spx_card.appendChild(spx_thumb);
    spx_card.appendChild(spx_body);
    return spx_card;
  }

  // 渲染全部图文卡片并更新数量
  function spx_renderGallery(spx_galleryList) {
    const spx_fragment = document.createDocumentFragment();
    spx_galleryList.forEach(function (spx_item, spx_index) {
      spx_fragment.appendChild(spx_createCard(spx_item, spx_index));
    });
    spx_grid.appendChild(spx_fragment);
    spx_count.textContent = '共 ' + spx_galleryList.length + ' 条图文';
  }

  // 请求接口获取图文数据
  async function spx_loadGallery() {
    try {
      const spx_response = await fetch(spx_apiUrl);
      const spx_result = await spx_response.json();
      console.log('图文列表接口返回：', spx_result);

      if (spx_result.code !== 0) {
        spx_showStatus('加载失败：' + spx_result.msg, true);
        console.error('图文列表加载失败：', spx_result.msg);
        return;
      }

      const spx_galleryList = spx_result.data || [];
      spx_status.classList.add('spx_status--hidden');
      spx_renderGallery(spx_galleryList);
      console.log('图文条数：', spx_galleryList.length);
    } catch (spx_error) {
      spx_showStatus('请求失败：' + spx_error.message + '（请确认后端服务已启动：http://localhost:8405）', true);
      console.error('调用 /api/gallery 接口失败：', spx_error);
    }
  }

  spx_loadGallery();
})();
