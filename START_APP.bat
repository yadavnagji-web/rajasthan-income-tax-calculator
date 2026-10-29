@echo off
title Rajasthan Income Tax Calculator Launcher
cd /d "E:\Rajasthan Income Tax Calculator"
echo ====================================================
echo Rajasthan Income Tax Calculator (New vs Old Regime)
echo Local server starting...
echo ====================================================
start http://localhost:5173/
npm.cmd run dev -- --host
pause
