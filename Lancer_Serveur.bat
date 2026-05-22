@echo off
title Registre National du Cancer - Serveur Central
cd /d "%~dp0"
echo [.] Demarrage du script d'auto-detection de l'adresse IP...
python run_server.py
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Impossible de lancer le serveur. Verifiez que Python est installe et dans votre PATH.
    pause
)
