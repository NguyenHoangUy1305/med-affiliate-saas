@echo off
chcp 65001 >nul
title MedAffiliate SaaS Stopper
color 0C

echo ================================================================
echo      🛑 MED-AFFILIATE SAAS - SHUTDOWN HELPER
echo ================================================================
echo.

:: 1. Tắt các cửa sổ Backend và Frontend
echo [1/2] Đang đóng các tiến trình Node.js Backend & Frontend...
taskkill /FI "WINDOWTITLE eq MedAffiliate - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq MedAffiliate - Frontend*" /T /F >nul 2>&1

:: 2. Dừng Docker containers (giữ nguyên dữ liệu CSDL)
echo [2/2] Đang dừng Docker containers (MySQL & Adminer)...
cd /d "%~dp0infrastructure"
docker compose stop
echo  ==^> Docker containers đã dừng an toàn! (Dữ liệu database được giữ nguyên)
echo.

echo ================================================================
echo  ✅ ĐÃ TẮT TOÀN BỘ HỆ THỐNG THÀNH CÔNG!
echo ================================================================
timeout /t 3 >nul
exit
