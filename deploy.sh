#!/bin/bash

echo "🚀 Déploiement de La Machine Bot"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Fichier .env manquant!"
    echo "Copie .env.example vers .env et configure les variables:"
    echo "  - DISCORD_TOKEN"
    echo "  - DISCORD_CLIENT_ID"
    echo "  - OPENAI_API_KEY (optionnel)"
    exit 1
fi

# Install dependencies
echo "📦 Installation des dépendances..."
npm install

# Build the project
echo "🔨 Compilation TypeScript..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build réussi!"
    echo ""
    echo "Pour lancer le bot:"
    echo "  Production: npm start"
    echo "  Développement: npm run dev"
else
    echo "❌ Erreur lors du build"
    exit 1
fi