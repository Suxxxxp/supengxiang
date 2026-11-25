# 开发指令记录

> 记录格式：时间 | 提示词全文 | 大模型名称

---

## 记录 1

**时间**：2026-11-25 14:00

**提示词全文**：

在当前项目根目录创建 AGENTS.md，写入以下规则。

## 项目结构与技术栈
- 前端：frontend/ 目录
  - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
  - 目录结构：frontend/ 下建 css/、js/、fonts/、images/ 子目录；fonts/ 存放 iconfont 图标文件（如果有）
- 后端：backend/ 目录，Node.js + Express，RESTful+MVC 风格，所有接口以 /api/ 为前缀，端口固定为 8405（405 为本人学号最后三位）
- 使用 express.static 托管 frontend/ 静态资源目录。
- 后端通过 cors 中间件开放全部跨域访问，本配置仅用于课程作业。
- 后端依赖安装：预先将 npm 源切换为国内镜像：npm config set registry https://registry.npmmirror.com
- 后端依赖安装：npm i 包名
- 数据库：MySQL（用户名 root、密码：root）
- 数据库凭据写入 backend/.env（变量名：DB_USER、DB_PASSWORD、DB_HOST、DB_NAME），不得出现在代码或 AGENTS.md 中；.env 同时加入 .gitignore
- 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据

## 命名与注释
- CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）一律以 spx_ 开头
- 每个文件头部包含注释块：姓名：宿鹏翔 | 学号：24002120405 | 时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}

## 记录文件（一律追加写入，禁止覆盖已有内容）
- supengxiang_prompt.md（项目根目录）：每次向 AI 发出开发指令后，追加记录：时间 | 提示词全文 | 大模型名称
- backend/spx_interface.md：每次创建或修改接口后，追加：接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间
- backend/spx_database.md：每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），要求仅凭此文件即可在新机器上完整重建数据库
- 统一 JSON 响应格式：{ "code": 0, "msg": "提示信息", "data": {...} }，code=0 表示成功，非 0 表示失败

## 前端约定
- 服务器返回的数据和错误信息输出到浏览器控制台（console.log / console.error）；
- 新建 HTML 页面后，在 frontend/index.html 中追加超链接入口；文件名包含 detail 的页面除外

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 2

**时间**：2026-11-25 14:10

**提示词全文**：

请初始化本项目：
1、git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页 index.html，包括姓名宿鹏翔、学号24002120405、项目名称、项目类别（自选、模仿），所有完成的 html 页面的超链接。有 canvas 背景动画。主体是页面链接导航。页面美观。
4、创建 readme.md，在根目录下，包括学号、姓名。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 3

**时间**：2026-11-25 14:20

**提示词全文**：

创建运行后台的 bat 文件，放在项目根目录：
1、自动切换到 backend 目录再启动（用 %~dp0，双击时不受当前路径影响）；
2、使用 chcp 65001 避免中文日志乱码；
3、启动命令与 package.json 中的脚本保持一致；
4、结尾加 pause，出错时窗口不关闭。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 4

**时间**：2026-11-25 14:40

**提示词全文**：

在 frontend/ 下创建 database.html：
1、页面有用户名、密码两个输入框，默认用户名 root，密码默认 root，一个"测试连接"按钮；
2、点击后调用后端接口 /api/db-test，把用户名密码发给后端；
3、后端用 mysql2 尝试连接 MySQL，成功返回 { code:0, msg:"数据库连接成功", data:{ 数据库版本 } }，失败返回 code 非 0 和错误信息；
4、前端把结果显示在页面上：成功用绿色，失败用红色，同时在控制台输出；
5、数据库凭据从 backend/.env 读取，不要写死在代码里；
6、完成后在 frontend/index.html 加上本页面的超链接入口。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 5

**时间**：2026-11-25 15:05

**提示词全文**：

完成科技新闻列表页面：
1、在 MySQL 中建表 spx_news，字段包含：id、title、summary、content、source、publish_time、cover_img；
2、插入至少 8 条真实的科技新闻测试数据；
3、后端提供 GET /api/news 接口，返回全部新闻（按发布时间倒序），统一 JSON 格式 { code, msg, data }；
4、新建 frontend/news.html，页面顶部显示当前调用的接口地址，下方以列表展示新闻标题、摘要、来源、时间；
5、数据用 fetch 获取，控制台输出返回数据；
6、把建表与插入数据的 SQL 追加写入 backend/spx_database.md，接口信息追加写入 backend/spx_interface.md，本次提示词追加写入 supengxiang_prompt.md；
7、在 frontend/index.html 增加入口链接。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 6

**时间**：2026-11-25 15:35

**提示词全文**：

完成图文列表页面：
1、在 MySQL 中新建表 spx_gallery，字段：id、title、description、img_url、category、create_time，插入至少 8 条测试数据；
2、后端提供 GET /api/gallery 接口，返回全部图文数据；
3、新建 frontend/gallery.html，页面顶部显示接口地址，下方用网格布局展示"上图下文"卡片：图片、标题、描述；
4、图片加载失败时显示占位色块，不要出现破图图标；
5、页面适配手机宽度；
6、记录写入 backend/spx_database.md、backend/spx_interface.md 和 supengxiang_prompt.md，并在首页加入口。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 7

**时间**：2026-11-25 16:05

**提示词全文**：

都是请求失败
（附两张截图：通过 IDE 预览端口 127.0.0.1:49652 打开 news.html / gallery.html，页面提示“请求失败：Unexpected token 'F', "File unavailable" is not valid JSON”）

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 8

**时间**：2026-11-25 16:40

**提示词全文**：

使用硅基流动API key创建基本AI应用:AI聊天
Api-key：sk-****（已打码）

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 9

**时间**：2026-11-25 16:55

**提示词全文**：

curl --request POST ^
  --url `https://api.siliconflow.cn/v1/chat/completions` ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer sk-****（已打码）" ^
  -d "{\"model\":\"deepseek-ai/DeepSeek-V4-Flash\",\"messages\":[{\"role\":\"system\",\"content\":\"你是一个有用的助手\"},{\"role\":\"user\",\"content\":\"你好，请介绍一下你自己\"}]}"

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 10

**时间**：2026-11-25 17:25

**提示词全文**：

做这五步 我的key是sk-****（已打码）
（附截图“跟我五步”：1 把 Key 写进后端 .env；2 让 AI 写后端接口 /api/chat；3 写聊天页面（输入框 + 发送按钮 + 消息区，等待时显示“正在思考...”）；4 多轮对话：维护 messages 数组，每轮把用户消息与 AI 回复都 push 进去，每次请求发送之前的全部对话；5 测试“你好”→“我刚才问了什么”验证多轮，并把提示词记入 prompt 文件）

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 11

**时间**：2026-11-25 17:45

**提示词全文**：

使用七牛的 api key 完成在线客服页面：
Model ID：qiniu/conatus-free
Api-key：sk-****（已打码）
OpenAI BaseURL：`https://api.qnaigc.com/v1`

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 12

**时间**：2026-11-25 18:10

**提示词全文**：

sk-****（已打码）

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 13

**时间**：2026-11-25 18:35

**提示词全文**：

任务二：把 AI 聊天改造成"中华美食街在线客服"：只回答营业时间、招牌菜、配送范围三类问题；问到其他内容时礼貌引导留言。要求写出 system 提示词、测试 5 个问题（3 个该答、2 个该拒），并解释为什么这样写能"管住"模型。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 14

**时间**：2026-11-25 19:05

**提示词全文**：

任务三：让页面支持在"硅基流动 / 七牛"之间切换（后端读取配置即可，前端加一个下拉框），并现场演示切换后照常对话。答辩三问：① 为什么 Key 不能放前端？② 多轮对话为什么要把历史消息一起发？③ 换个平台你改哪几个值？为什么只改这几个？

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 15

**时间**：2026-11-25 19:40

**提示词全文**：

（按统一规范调整 .env 变量命名）硅基流动 API Key、SILICONFLOW_BASE_URL、SILICONFLOW_MODEL=Qwen/Qwen2.5-7B-Instruct、SILICONFLOW_VISION_MODEL=Qwen/Qwen3-VL-8B-Instruct（Key 已打码）；AI_PROVIDER=siliconflow；七牛配置改为 QINIU_CUSTOMER_SERVICE_BASE_URL / QINIU_CUSTOMER_SERVICE_MODEL / QINIU_CUSTOMER_SERVICE_API_KEY。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 16

**时间**：2026-11-25 20:10

**提示词全文**：

使用硅基流动完成在线客服页面：（追问确认后）在 service.html 加平台切换，可在硅基流动 / 七牛云之间切换。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 17

**时间**：2026-11-25 20:25

**提示词全文**：

完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地文件（如 PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 18

**时间**：2026-11-25 20:40

**提示词全文**：

完成图像识别功能，上传图片，返回该图片的描述，使用已有的api-key和模型。

**大模型名称**：DeepSeek-V4.1-Flash

---

## 记录 19

**时间**：2026-11-25 21:00

**提示词全文**：

实现一个语音识别的功能，使用七牛的Qwen-Audio-3.0-ASR-Flash模型，输入语音，输出文字

**大模型名称**：DeepSeek-V4.1-Flash

---
