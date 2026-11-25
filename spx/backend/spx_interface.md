# 接口文档

姓名：宿鹏翔 | 学号：24002120405 | 大模型：DeepSeek-V4.1-Flash

> 记录格式：接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间
> 所有接口统一前缀 `/api`，响应体统一为 `{ "code": 0, "msg": "...", "data": {...} }`，`code = 0` 表示成功。

---

## 1. 数据库连接测试

- **接口路径**：`/api/db-test`
- **HTTP 方法**：`POST`
- **请求参数**（JSON 请求体）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| user | string | 否 | MySQL 用户名，留空时使用后端 `.env` 中的 `DB_USER` |
| password | string | 否 | MySQL 密码，留空时使用后端 `.env` 中的 `DB_PASSWORD` |

请求示例：

```json
{
  "user": "root",
  "password": "root"
}
```

- **响应格式**：

成功：

```json
{
  "code": 0,
  "msg": "数据库连接成功",
  "data": { "version": "8.0.36" }
}
```

失败（HTTP 状态码仍为 200，`code` 非 0）：

```json
{
  "code": 500,
  "msg": "数据库连接失败：Access denied for user 'root'@'localhost' (using password: YES)",
  "data": null
}
```

- **修改时间**：2026-11-25

---

## 2. 获取科技新闻列表

- **接口路径**：`/api/news`
- **HTTP 方法**：`GET`
- **请求参数**：无

请求示例：`GET http://localhost:8405/api/news`

- **响应格式**：

成功（`data` 为全部新闻数组，按 `publish_time` 倒序）：

```json
{
  "code": 0,
  "msg": "获取新闻列表成功",
  "data": [
    {
      "id": 3,
      "title": "深度求索发布开源推理模型 DeepSeek-R1",
      "summary": "国产大模型团队深度求索发布 DeepSeek-R1，通过强化学习提升推理能力，并开源模型权重。",
      "content": "2025 年 1 月 20 日，深度求索正式发布推理模型 DeepSeek-R1……",
      "source": "科技日报",
      "publish_time": "2025-01-20 20:00",
      "cover_img": "images/spx_news_03.jpg"
    }
  ]
}
```

失败：

```json
{
  "code": 500,
  "msg": "获取新闻列表失败：ER_NO_SUCH_TABLE: Table 'spx_db.spx_news' doesn't exist",
  "data": null
}
```

- **修改时间**：2026-11-25

---

## 3. 获取图文列表

- **接口路径**：`/api/gallery`
- **HTTP 方法**：`GET`
- **请求参数**：无

请求示例：`GET http://localhost:8405/api/gallery`

- **响应格式**：

成功（`data` 为全部图文数组，按 `create_time` 倒序）：

```json
{
  "code": 0,
  "msg": "获取图文列表成功",
  "data": [
    {
      "id": 1,
      "title": "AI 算力数据中心扩容",
      "description": "大规模 GPU 集群为训练大模型提供算力支撑，液冷散热与高速互联成为新建数据中心的关键技术。",
      "img_url": "https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=...&image_size=landscape_4_3",
      "category": "人工智能",
      "create_time": "2026-11-24 10:30"
    }
  ]
}
```

失败：

```json
{
  "code": 500,
  "msg": "获取图文列表失败：ER_NO_SUCH_TABLE: Table 'spx_db.spx_gallery' doesn't exist",
  "data": null
}
```

- **修改时间**：2026-11-25

---

## 4. AI 聊天（硅基流动）

- **接口路径**：`/api/chat`
- **HTTP 方法**：`POST`
- **请求参数**（JSON 请求体）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| messages | array | 是 | 对话消息数组，1~20 条，每条含 `role`（system/user/assistant）与 `content`（≤4000 字） |

请求示例：

```json
{
  "messages": [
    { "role": "system", "content": "你是一个乐于助人的中文 AI 助手，回答简洁准确。" },
    { "role": "user", "content": "用一句话介绍你自己" }
  ]
}
```

- **响应格式**：

成功（密钥与模型名由 backend/.env 中的 `SILICONFLOW_API_KEY`、`SILICONFLOW_MODEL` 提供）：

```json
{
  "code": 0,
  "msg": "AI 回复成功",
  "data": {
    "reply": "我是 DeepSeek 最新版模型，一个由深度求索公司开发的免费纯文本 AI 助手。",
    "model": "deepseek-ai/DeepSeek-V3",
    "usage": { "prompt_tokens": 28, "completion_tokens": 21, "total_tokens": 49 }
  }
}
```

失败（参数不合法时 `code = 400`，调用上游失败时 `code = 500`）：

```json
{
  "code": 500,
  "msg": "AI 回复失败：invalid api key",
  "data": null
}
```

- **修改时间**：2026-11-25

- **变更记录**：2026-11-25 16:55 默认模型由 `Qwen/Qwen2.5-7B-Instruct` 切换为 `deepseek-ai/DeepSeek-V4-Flash`（改 `.env` 的 `SILICONFLOW_MODEL` 即可更换）
- **变更记录**：2026-11-25 17:25 `deepseek-ai/DeepSeek-V4-Flash` 上游持续超时（实测 25 秒无响应、偶发 50507），默认模型改为稳定的 `deepseek-ai/DeepSeek-V3`；单次请求超时 25 秒，上游 5xx / 网络异常自动重试最多 3 次
- **变更记录**：2026-11-25 18:35 接口改造为「中华美食街在线客服」：system 人设改为固定客服（只回答营业时间、招牌菜、配送范围，其余问题统一引导留言），由服务端注入并丢弃前端传入的 system 消息；成功提示语改为「客服回复成功」
- **变更记录**：2026-11-25 19:05 `/api/chat` 新增可选参数 `provider`（`siliconflow` | `qiniu`，不传时取 `.env` 的 `CHAT_PROVIDER_DEFAULT`，默认 `siliconflow`）；新增 `GET /api/chat/providers` 供前端下拉框读取可切换平台。
- **变更记录**：2026-11-25 19:40 环境变量按统一规范重命名：`CHAT_PROVIDER_DEFAULT` → `AI_PROVIDER`，`QINIU_*` → `QINIU_CUSTOMER_SERVICE_*`；硅基流动默认模型改为 `Qwen/Qwen2.5-7B-Instruct`。接口路径与参数不变。

### GET /api/chat/providers

- **请求参数**：无
- **响应示例**：

```json
{
  "code": 0,
  "msg": "获取模型平台列表成功",
  "data": {
    "default": "siliconflow",
    "providers": [
      { "id": "siliconflow", "name": "硅基流动 · deepseek-ai/DeepSeek-V3", "available": true },
      { "id": "qiniu", "name": "七牛云 · qiniu/conatus-free", "available": true }
    ]
  }
}
```

- **修改时间**：2026-11-25


---

## 5. 在线客服（七牛云）

- **接口路径**：`/api/service`
- **HTTP 方法**：`POST`
- **请求参数**（JSON 请求体）：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| provider | string | 否 | 模型平台：`siliconflow`（默认，取 `.env` 的 `AI_PROVIDER`）或 `qiniu`；传入非法值返回 `code=400` |
| messages | array | 是 | 对话消息数组，1~20 条，每条含 `role`（user/assistant）与 `content`（≤1000 字）；客服人设（system）由后端自动附加 |

请求示例：

```json
{
  "messages": [
    { "role": "user", "content": "网站有哪些页面？" }
  ]
}
```

- **响应格式**：

成功（密钥、地址与模型名由 backend/.env 中的 `QINIU_API_KEY`、`QINIU_BASE_URL`、`QINIU_MODEL` 提供）：

```json
{
  "code": 0,
  "msg": "客服回复成功",
  "data": {
    "reply": "本站包含首页、科技新闻、图文列表、数据库连接测试、AI 聊天和在线客服页面。",
    "model": "qiniu/conatus-free",
    "usage": { "prompt_tokens": 120, "completion_tokens": 30, "total_tokens": 150 }
  }
}
```

失败（参数不合法时 `code = 400`，调用上游失败时 `code = 500`）：

```json
{
  "code": 500,
  "msg": "客服回复失败：Invalid API key",
  "data": null
}
```

- **修改时间**：2026-11-25

- **备注**：2026-11-25 首次联调时，配置的 `QINIU_API_KEY` 被七牛云返回 `401 Invalid API key`（该值为硅基流动的 Key），待更换为七牛云控制台签发的有效 Key 后即可正常对话；单次请求超时 30 秒，上游 5xx / 网络异常自动重试最多 3 次。
- **变更记录**：2026-11-25 18:10 更换有效的七牛云 Key，`qiniu/conatus-free` 实测返回 `code=0`；该免费模型存在全局限流（`429 free_campaign_global_limit`），因此新增 `QINIU_FALLBACK_MODEL`（默认 `deepseek/deepseek-v4.1-flash`），主模型限流 / 下线时自动切换。
- **变更记录**：2026-11-25 20:10 `/api/service` 支持平台切换：新增可选参数 `provider`（`siliconflow` | `qiniu`，默认取 `AI_PROVIDER`）；平台配置与分发抽到 `models/spx_provider.model.js` 复用；环境变量 `QINIU_FALLBACK_MODEL` 更名为 `QINIU_CUSTOMER_SERVICE_FALLBACK_MODEL`。

---

## 6. 知识库问答（RAG）

### POST /api/kb/upload

- **接口路径**：`/api/kb/upload`
- **HTTP 方法**：`POST`（multipart/form-data）
- **请求参数**：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | file | 是 | 知识库文件，支持 doc / docx / ppt / pptx / pdf / txt / md，单文件 ≤10MB |

响应示例：

```json
{
  "code": 0,
  "msg": "知识库文件上传成功",
  "data": {
    "id": 5,
    "filename": "中华美食街门店服务手册.docx",
    "ext": ".docx",
    "size": 10699,
    "char_count": 740,
    "chunk_count": 4
  }
}
```

### GET /api/kb/files

- **接口路径**：`/api/kb/files`
- **HTTP 方法**：`GET`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 0,
  "msg": "获取知识库文件列表成功",
  "data": {
    "files": [
      {
        "id": 6,
        "spx_filename": "中华美食街常见问题.pptx",
        "spx_ext": ".pptx",
        "spx_size": 100724,
        "spx_chunk_count": 4,
        "spx_create_time": "2026-11-25 20:19"
      }
    ],
    "stats": { "spx_file_count": 2, "spx_chunk_count": 8 }
  }
}
```

### DELETE /api/kb/files/:id

- **接口路径**：`/api/kb/files/:id`
- **HTTP 方法**：`DELETE`
- **请求参数**：路径参数 id（文件 id）
- **响应示例**：`{ "code": 0, "msg": "文件已从知识库删除", "data": { "id": 3 } }`

### POST /api/kb/ask

- **接口路径**：`/api/kb/ask`
- **HTTP 方法**：`POST`
- **请求参数**：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| question | string | 是 | 用户问题，2~500 字 |
| provider | string | 否 | `siliconflow`（默认）或 `qiniu` |

请求示例：

```json
{ "question": "你们几点营业？", "provider": "siliconflow" }
```

响应示例（`references` 为检索到的片段，`request_messages` 为实际发送给大模型的完整数据）：

```json
{
  "code": 0,
  "msg": "知识库问答成功",
  "data": {
    "answer": "门店每天从10:00开始营业，22:00打烊，21:30后停止点单。春节期间初一至初三休市。[1][2]",
    "references": [
      { "spx_file_id": 5, "spx_filename": "中华美食街门店服务手册.docx", "spx_index": 1, "spx_content": "……", "spx_score": 6.421 }
    ],
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "usage": { "prompt_tokens": 685, "completion_tokens": 48, "total_tokens": 733 },
    "provider": "siliconflow",
    "request_messages": [
      { "role": "system", "content": "你是「中华美食街」的知识库客服助手……" },
      { "role": "user", "content": "【参考资料】……【用户问题】你们几点营业？" }
    ]
  }
}
```

- **实现说明**：上传后解析为纯文本并按 220 字/片段、句边界重叠 50 字切片入库；问答时用 BM25（中文二元组分词）检索 Top4 片段，拼入提示词后调用大模型；检索为空时不加引用编号。
- **修改时间**：2026-11-25

## 7. 图像识别（多模态）

### POST /api/vision

- **接口路径**：`/api/vision`
- **HTTP 方法**：`POST`（multipart/form-data）
- **请求参数**：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| image | file | 是 | 图片文件，支持 jpg / jpeg / png / webp / gif，单文件 ≤8MB |

- **调用模型**：`.env` 中的 `SILICONFLOW_VISION_MODEL`（默认 `Qwen/Qwen3-VL-8B-Instruct`），使用硅基流动 Key。
- **响应示例**：

```json
{
  "code": 0,
  "msg": "图像识别成功",
  "data": {
    "description": "主体内容：一条笔直的通道，两侧排列着整齐的服务器机柜……",
    "model": "Qwen/Qwen3-VL-8B-Instruct",
    "usage": { "prompt_tokens": 3703, "completion_tokens": 136, "total_tokens": 3839 }
  }
}
```

- **变更记录**：2026-11-25 20:40 新增图像识别接口；同时在 `app.js` 增加统一上传异常处理，非法文件类型 / 超限返回标准 JSON（此前 multer 错误会返回 HTML 堆栈）。
- **修改时间**：2026-11-25

## 8. 语音识别（ASR）

### POST /api/asr

- **接口路径**：`/api/asr`
- **HTTP 方法**：`POST`（multipart/form-data）
- **请求参数**：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| audio | file | 是 | 音频文件，支持 wav / mp3 / m4a / webm / ogg / amr，单文件 ≤20MB |

- **调用模型**：`.env` 中的 `QINIU_ASR_MODEL`（默认 `qwen-audio-3.0-asr-flash`），接口 `POST https://api.qnaigc.com/v1/audio/transcriptions`，使用七牛 Key。
- **响应示例**：

```json
{
  "code": 0,
  "msg": "语音识别成功",
  "data": {
    "text": "你好，欢迎使用语音识别功能。今天天气不错，适合出门散步。",
    "model": "qwen-audio-3.0-asr-flash",
    "usage": { "seconds": 8, "type": "duration" },
    "filename": "spx_asr_test.wav",
    "size": 357790
  }
}
```

- **报错示例**：非法格式返回 `{ "code": 400, "msg": "上传失败：仅支持 wav / mp3 / m4a / webm / ogg / amr 音频", "data": null }`。
- **修改时间**：2026-11-25
