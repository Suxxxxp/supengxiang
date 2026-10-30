---
name: push-to-github
description: Commit this project and push to GitHub Suxxxxp/supengxiang over SSH with the configured key. Use when the user says 提交到github, push to GitHub, or asks to commit and push this project. Do not use for other remotes.
---

# 提交到 GitHub

将本项目（工作区根目录）提交 commit 并 push 到 `git@github.com:Suxxxxp/supengxiang.git`，使用已设置的 SSH 公钥（`~/.ssh/id_ed25519`，对应 GitHub 账号需已添加该公钥）。

## 执行方式

在工作区根目录运行脚本（可选传入提交信息）：

```powershell
powershell -ExecutionPolicy Bypass -File .trae/skills/push-to-github/scripts/push-to-github.ps1 -Message "提交信息"
```

脚本行为：

- 若工作区不是 git 仓库则先 `git init`
- 确保 `origin` 指向 `git@github.com:Suxxxxp/supengxiang.git`（SSH，走已设置的公钥，不用 HTTPS）
- `git add -A` 暂存全部变更，用给定信息提交 commit（未给信息时默认带时间戳）
- push 到当前分支并设置 upstream；无分支名时重命名为 `main`

## 失败处理

- `Permission denied (publickey)` — 公钥未添加到 GitHub 账号。输出 `~/.ssh/id_ed25519.pub` 的内容，让用户粘贴到 https://github.com/settings/ssh/new ，然后重新运行脚本。
- `Repository not found` — 远端仓库不存在。让用户先在 GitHub 创建名为 `supengxiang` 的空仓库（不要初始化 README），然后重新运行脚本。
- 首次连接的 host key 确认 — 脚本已通过 `StrictHostKeyChecking=accept-new` 自动处理，无需人工干预。
