@echo off
setlocal enabledelayedexpansion

echo 🚀 Déploiement de La Machine Bot
echo ================================
echo.

REM Check if .env exists
if not exist .env (
    echo ❌ Fichier .env manquant!
    echo Copie .env.example vers .env et configure les variables:
    echo   - DISCORD_TOKEN
    echo   - DISCORD_CLIENT_ID
    echo   - OPENAI_API_KEY (optionnel)
    exit /b 1
)

REM Install dependencies
echo 📦 Installation des dépendances...
call npm install
if !errorlevel! neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    exit /b 1
)

REM Build the project
echo 🔨 Compilation TypeScript...
call npm run build
if !errorlevel! neq 0 (
    echo ❌ Erreur lors du build
    exit /b 1
) else (
    echo ✅ Build réussi!
    echo.
    echo Pour lancer le bot:
    echo   Production: npm start
    echo   Développement: npm run dev
)

endlocal