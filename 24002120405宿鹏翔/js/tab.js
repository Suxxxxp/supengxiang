/**
 * 作者：宿鹏翔
 * 建立时间：2026-11-04
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：新闻 Tab 选项卡切换（可复用组件）
 */

// 实现：初始化单个选项卡容器，为其中所有选项按钮绑定点击监听事件
function initTabs(tabRoot) {
    var buttons = tabRoot.querySelectorAll('.tab-btn');

    // 实现：选项卡被点击时，先清除全部选项卡的选中状态，再设置当前点击元素的选中状态
    function handleTabClick(event) {
        var currentBtn = event.currentTarget;
        var targetId = currentBtn.dataset.target;

        // 第一步：清除所有选项按钮的选中状态，并隐藏所有内容面板
        buttons.forEach(function (btn) {
            btn.classList.remove('active');
        });
        tabRoot.querySelectorAll('.tab-panel').forEach(function (panel) {
            panel.classList.remove('active');
        });

        // 第二步：设置当前点击按钮的选中状态，并显示对应的内容面板
        currentBtn.classList.add('active');
        var currentPanel = tabRoot.querySelector('#' + targetId);
        if (currentPanel) {
            currentPanel.classList.add('active');
        }
    }

    // 实现：遍历所有选项按钮，逐个注册点击监听
    buttons.forEach(function (btn) {
        btn.addEventListener('click', handleTabClick);
    });
}

// 实现：页面加载完成后，自动查找页面上所有选项卡容器并逐个初始化，实现组件复用
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tabs').forEach(function (tabRoot) {
        initTabs(tabRoot);
    });
});
