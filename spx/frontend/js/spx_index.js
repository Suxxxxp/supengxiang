/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：首页页面链接导航渲染（依据页面清单自动生成卡片）
 */
(function () {
  'use strict';

  // 页面清单：每完成一个新页面，在此追加一项即可自动生成导航卡片
  const spx_pages = [
    {
      spx_name: '项目首页',
      spx_path: 'index.html',
      spx_desc: '展示姓名、学号、项目名称与所属类别，并汇总全部已完成页面的入口。',
      spx_badge: '当前页面'
    },
    {
      spx_name: '数据库连接测试',
      spx_path: 'database.html',
      spx_desc: '填写 MySQL 账号密码，调用后端 /api/db-test 接口验证数据库连接是否正常。',
      spx_badge: '功能测试'
    },
    {
      spx_name: '科技新闻',
      spx_path: 'news.html',
      spx_desc: '调用后端 /api/news 接口获取科技新闻，按发布时间倒序展示标题、摘要、来源与时间。',
      spx_badge: '数据列表'
    },
    {
      spx_name: '图文列表',
      spx_path: 'gallery.html',
      spx_desc: '调用后端 /api/gallery 接口获取图文数据，以网格卡片展示图片、标题与描述。',
      spx_badge: '图文展示'
    },
    {
      spx_name: '中华美食街客服',
      spx_path: 'chat.html',
      spx_desc: '调用后端 /api/chat 接口，只回答营业时间、招牌菜、配送范围，其他问题礼貌引导留言。',
      spx_badge: 'AI 应用'
    },
    {
      spx_name: '在线客服',
      spx_path: 'service.html',
      spx_desc: '调用后端 /api/service 接口，由七牛云大模型提供网站客服问答。',
      spx_badge: '智能客服'
    },
    {
      spx_name: '知识库问答',
      spx_path: 'kb.html',
      spx_desc: '上传 DOC/DOCX/PPTX/PDF/TXT 构建知识库，先检索片段再让大模型作答，答案附参考来源。',
      spx_badge: 'RAG'
    },
    {
      spx_name: '图像识别',
      spx_path: 'vision.html',
      spx_desc: '上传图片调用多模态模型，返回主体、场景、颜色与图中文字的中文描述。',
      spx_badge: '多模态'
    },
    {
      spx_name: '语音识别',
      spx_path: 'asr.html',
      spx_desc: '录制或上传音频，调用七牛云 Qwen-Audio-3.0-ASR-Flash 将语音转写为文字。',
      spx_badge: 'ASR'
    },
    {
      spx_name: 'LLM 实践测试展示',
      spx_path: '11.25.html',
      spx_desc: '11.25 汇总在线客服、知识库问答、图像识别、语音识别四项大模型实测结果，附 7 张过程截图与测试结论。',
      spx_badge: '11.25 实践'
    }
  ];

  const spx_grid = document.getElementById('spx_navGrid');
  const spx_count = document.getElementById('spx_navCount');

  // 返回页面图标 SVG 字符串
  function spx_pageIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M14 3v5h5" /><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2z" />' +
      '<path d="M8 13h8" /><path d="M8 17h5" /></svg>';
  }

  // 返回箭头图标 SVG 字符串
  function spx_arrowIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>';
  }

  // 创建一个页面的导航卡片
  function spx_createCard(spx_page, spx_index) {
    const spx_link = document.createElement('a');
    spx_link.className = 'spx_card';
    spx_link.href = spx_page.spx_path;
    spx_link.style.setProperty('--spx_i', spx_index);
    spx_link.innerHTML =
      '<div class="spx_card-top">' +
        '<span class="spx_card-icon">' + spx_pageIcon() + '</span>' +
        '<span class="spx_card-badge">' + spx_page.spx_badge + '</span>' +
      '</div>' +
      '<h3 class="spx_card-title">' + spx_page.spx_name + '</h3>' +
      '<p class="spx_card-desc">' + spx_page.spx_desc + '</p>' +
      '<span class="spx_card-path">/' + spx_page.spx_path + '</span>' +
      '<span class="spx_card-go">进入页面' + spx_arrowIcon() + '</span>';
    return spx_link;
  }

  // 创建占位卡片，提示后续页面会持续补充（不可点击）
  function spx_createPlaceholder(spx_index) {
    const spx_item = document.createElement('div');
    spx_item.className = 'spx_card spx_card-placeholder';
    spx_item.style.setProperty('--spx_i', spx_index);
    spx_item.innerHTML =
      '<div class="spx_card-top">' +
        '<span class="spx_card-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
          'stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>' +
        '</span>' +
      '</div>' +
      '<h3 class="spx_card-title">更多页面开发中</h3>' +
      '<p class="spx_card-desc">后续完成的页面会依次添加到上方导航清单。</p>';
    return spx_item;
  }

  // 渲染全部导航卡片并更新页面数量
  function spx_renderNav() {
    const spx_fragment = document.createDocumentFragment();
    spx_pages.forEach(function (spx_page, spx_index) {
      spx_fragment.appendChild(spx_createCard(spx_page, spx_index));
    });
    spx_fragment.appendChild(spx_createPlaceholder(spx_pages.length));
    spx_grid.appendChild(spx_fragment);
    spx_count.textContent = '共 ' + spx_pages.length + ' 个页面';
  }

  if (spx_grid && spx_count) {
    spx_renderNav();
  }
  console.log('页面导航数据：', spx_pages);
})();
