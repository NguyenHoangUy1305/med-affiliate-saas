@echo off
chcp 65001 >nul
title MedAffiliate SaaS Launcher
color 0A

echo ================================================================
echo      🏥 MED-AFFILIATE SAAS PLATFORM - ONE CLICK LAUNCHER
echo                 Tác giả: Nguyễn Hoàng Uy
echo ================================================================
echo.

:: 1. Khởi động Docker (MySQL 8.0 & Adminer)
echo [1/3] Đang khởi động Cơ sở Dữ liệu MySQL & Adminer qua Docker...
cd /d "%~dp0infrastructure"
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Không thể khởi động Docker! Hãy chắc chắn Docker Desktop đang chạy.
    pause
    exit /b %errorlevel%
)
echo  ==^> Docker containers đã sẵn sàng! (MySQL: 3306, Adminer: 8080)
echo.

:: 2. Khởi động Backend NestJS
echo [2/3] Đang khởi động Backend NestJS (Port 3001)...
start "MedAffiliate - Backend (NestJS :3001)" cmd /k "cd /d "%~dp0backend" && echo [NestJS] Đang khởi động Backend trên cổng 3001... && npm run start:dev"
echo  ==^> Cửa sổ Backend đã được bật!
echo.

:: 3. Khởi động Frontend NextJS
echo [3/3] Đang khởi động Frontend Next.js (Port 3000)...
start "MedAffiliate - Frontend (NextJS :3000)" cmd /k "cd /d "%~dp0frontend" && echo [Next.js] Đang khởi động Frontend trên cổng 3000... && npm run dev"
echo  ==^> Cửa sổ Frontend đã được bật!
echo.

echo ================================================================
echo  🚀 HỆ THỐNG ĐÃ KHỞI ĐỘNG XONG!
echo.
echo  - Frontend Storefront : http://localhost:3000
echo  - Backend API Gateway : http://localhost:3001
echo  - Quản trị DB Adminer : http://localhost:8080
echo ================================================================
echo.
echo Đang tự động mở trình duyệt sau 5 giây...
timeout /t 5 >nul
start http://localhost:3000
start http://localhost:8080

echo.
echo [Mẹo] Để tắt toàn bộ hệ thống khi xong việc, hãy chạy file stop-dev.bat!
pause
