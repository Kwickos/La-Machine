#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('\n🔍 Test de configuration Discord OAuth\n');
console.log('=====================================\n');

// Check Discord credentials
const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const callbackUrl = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback';

console.log('1. Variables d\'environnement:');
console.log('   DISCORD_CLIENT_ID:', clientId ? `✅ Configuré (${clientId.substring(0, 8)}...)` : '❌ NON CONFIGURÉ');
console.log('   DISCORD_CLIENT_SECRET:', clientSecret ? '✅ Configuré' : '❌ NON CONFIGURÉ');
console.log('   DISCORD_CALLBACK_URL:', callbackUrl);

if (!clientId || !clientSecret) {
    console.log('\n❌ Configuration incomplète!\n');
    console.log('Pour configurer Discord OAuth:');
    console.log('1. Allez sur https://discord.com/developers/applications');
    console.log('2. Sélectionnez votre application (ou créez-en une)');
    console.log('3. Dans "OAuth2" > "General":');
    console.log('   - Copiez le Client ID');
    console.log('   - Cliquez "Reset Secret" et copiez le Client Secret');
    console.log('   - Ajoutez ce Redirect URI:', callbackUrl);
    console.log('4. Ajoutez ces valeurs dans votre fichier .env:');
    console.log('   DISCORD_CLIENT_ID=votre_client_id');
    console.log('   DISCORD_CLIENT_SECRET=votre_client_secret');
    process.exit(1);
}

console.log('\n2. URL OAuth2 générée:');
const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=identify%20email%20guilds`;
console.log('   ' + oauthUrl);

console.log('\n3. Vérification du Redirect URI:');
console.log('   ⚠️  Assurez-vous que ce EXACT URI est dans Discord:');
console.log('   ' + callbackUrl);

console.log('\n4. Test de connexion MongoDB:');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/la-machine';
console.log('   URI:', mongoUri);

// Try to connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(mongoUri)
    .then(() => {
        console.log('   ✅ MongoDB connecté');
        mongoose.connection.close();
    })
    .catch(err => {
        console.log('   ⚠️  MongoDB non disponible (optionnel)');
        console.log('   ', err.message);
    })
    .finally(() => {
        console.log('\n✅ Configuration vérifiée!');
        console.log('\nPour tester l\'authentification:');
        console.log('1. Lancez le serveur: npm run dev:server');
        console.log('2. Lancez le frontend: npm run dev:web');
        console.log('3. Allez sur: http://localhost:3001/login');
        console.log('4. Cliquez sur "Se connecter avec Discord"');
        process.exit(0);
    });