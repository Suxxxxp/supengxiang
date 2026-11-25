# 个人作品集网站

- 学号：24002120405
- 姓名：宿鹏翔

## 项目简介

本项目为 Web 课程作业，类别为「自选」。项目采用前后端分离结构：前端为原生 HTML / CSS / JavaScript，后端为 Node.js + Express，数据存储使用 MySQL。

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 前端 | 原生 HTML、CSS、JavaScript（无第三方库、无框架、无 CDN） |
| 后端 | Node.js + Express（RESTful + MVC，接口前缀 `/api/`，端口 `8405`） |
| 数据库 | MySQL |

## 目录结构

```
spx/
├── frontend/            # 前端静态资源（由 express.static 托管）
│   ├── css/             # 样式文件
│   ├── js/              # 脚本文件
│   ├── fonts/           # iconfont 图标文件
│   ├── images/          # 图片资源
│   └── index.html       # 首页（页面链接导航）
├── backend/             # 后端服务
│   ├── app.js           # 服务入口
│   ├── routes/          # 路由层
│   ├── controllers/     # 控制层
│   ├── models/          # 数据层
│   └── .env             # 数据库凭据（已被 .gitignore 排除）
├── supengxiang_prompt.md    # 开发指令记录
├── AGENTS.md            # 项目开发规范
└── readme.md
```

## 运行方式

1. 安装后端依赖：

   ```
   cd backend
   npm i
   ```

2. 在 `backend/.env` 中配置数据库凭据（`DB_USER`、`DB_PASSWORD`、`DB_HOST`、`DB_NAME`）。

3. 启动服务：

   ```
   node app.js
   ```

4. 浏览器访问 `http://localhost:8405/`。
