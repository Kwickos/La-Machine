#!/bin/bash

echo "🚀 Démarrage de La Machine - Production"
echo "======================================="

# Check for required environment variables
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé!"
    echo "Copiez .env.example vers .env et configurez vos clés"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check MongoDB
echo "🔍 Vérification de MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB n'est pas installé"
    echo "Installez-le avec: brew install mongodb-community"
    echo "Démarrez-le avec: brew services start mongodb-community"
    read -p "Continuer sans MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB détecté"
fi

# Check Discord credentials
if [ -z "$DISCORD_TOKEN" ]; then
    echo "⚠️  DISCORD_TOKEN non configuré"
fi

if [ -z "$DISCORD_CLIENT_ID" ] || [ -z "$DISCORD_CLIENT_SECRET" ]; then
    echo "⚠️  Discord OAuth non configuré (DISCORD_CLIENT_ID/SECRET manquant)"
    echo "Créez une application sur https://discord.com/developers/applications"
fi

# Build the project
echo ""
echo "🔨 Construction du projet..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Échec de la construction"
    exit 1
fi

echo "✅ Construction terminée"

# Start services
echo ""
echo "🚀 Démarrage des services..."
echo "Bot Discord: http://localhost:${WEB_PORT:-3000}"
echo "Dashboard: http://localhost:3001"
echo ""

# Start both bot and web server
npm run start:all