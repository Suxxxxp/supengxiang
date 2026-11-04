/**
 * 作者：宿鹏翔
 * 建立时间：2026-11-04
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：新闻 Tab 选项卡切换（可复用组件）
 */

// 宿鹏翔：初始化单个选项卡容器，为其中所有选项按钮绑定点击监听事件
function spx_initTabs(spx_tabRoot) {
    var spx_buttons = spx_tabRoot.querySelectorAll('.spx_tab_btn');

    // 宿鹏翔：选项卡被点击时，先清除全部选项卡的选中状态，再设置当前点击元素的选中状态
    function spx_handleTabClick(spx_event) {
        var spx_currentBtn = spx_event.currentTarget;
        var spx_targetId = spx_currentBtn.dataset.target;

        // 宿鹏翔：第一步，清除所有选项按钮的选中状态，并隐藏所有内容面板
        spx_buttons.forEach(function (spx_btn) {
            spx_btn.classList.remove('spx_active');
        });
        spx_tabRoot.querySelectorAll('.spx_tab_panel').forEach(function (spx_panel) {
            spx_panel.classList.remove('spx_active');
        });

        // 宿鹏翔：第二步，设置当前点击按钮的选中状态，并显示对应的内容面板
        spx_currentBtn.classList.add('spx_active');
        var spx_currentPanel = spx_tabRoot.querySelector('#' + spx_targetId);
        if (spx_currentPanel) {
            spx_currentPanel.classList.add('spx_active');
        }
    }

    // 宿鹏翔：遍历所有选项按钮，逐个注册点击监听
    spx_buttons.forEach(function (spx_btn) {
        spx_btn.addEventListener('click', spx_handleTabClick);
    });
}

// 宿鹏翔：页面加载完成后，自动查找页面上所有选项卡容器并逐个初始化，实现组件复用
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.spx_tabs').forEach(function (spx_tabRoot) {
        spx_initTabs(spx_tabRoot);
    });
});
