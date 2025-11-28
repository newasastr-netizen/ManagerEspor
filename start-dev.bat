@echo off
title LCK Manager 2025 - Development Server

echo.
echo =================================================
echo      LCK Manager 2025 Gelistirme Ortami
echo =================================================
echo.

echo Proje bagimliliklari kontrol ediliyor (npm install)...
call npm install

echo.
echo Gelistirme sunucusu baslatiliyor...
rem Sunucuyu yeni bir komut istemi penceresinde baslatir.
start "LCK Manager Server" cmd /k "npm run dev"

echo.
echo Sunucunun ayaga kalkmasi icin 10 saniye bekleniyor...
timeout /t 10 /nobreak >nul

echo.
echo Uygulama tarayicida aciliyor: http://localhost:3000/
start http://localhost:3000/

echo.
echo Iyi calismalar! Sunucu penceresini kapatarak sunucuyu durdurabilirsiniz.
echo.

exit
