@echo off
REM 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
REM 功能：双击即可切换到 backend 目录，并以 package.json 中的 start 脚本启动后台服务
chcp 65001 >nul

REM 使用 %~dp0 定位脚本所在目录，双击运行时不受当前路径影响
cd /d "%~dp0backend"

if not exist "package.json" (
    echo [错误] 未找到 backend\package.json，请确认项目目录结构是否完整。
    pause
    exit /b 1
)

echo ==========================================
echo  个人作品集网站 - 后台服务启动中
echo  访问地址：http://localhost:8405/
echo  按 Ctrl+C 可停止服务
echo ==========================================
echo.

REM 与 package.json 中 "start": "node app.js" 保持一致
call npm start

echo.
echo 服务已退出。
pause
