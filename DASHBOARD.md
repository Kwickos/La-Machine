# Dashboard Web - La Machine

## 🎯 Aperçu

Le dashboard web offre une interface complète pour gérer le bot Discord "La Machine" sans utiliser les commandes slash. Il utilise l'authentification Discord OAuth2 pour une sécurité maximale et récupère les vraies données depuis Discord et MongoDB.

## 🔐 Authentification Discord OAuth2

### Configuration

1. **Créer une application Discord** :
   - Allez sur https://discord.com/developers/applications
   - Créez une nouvelle application ou utilisez celle de votre bot
   - Dans "OAuth2" > "General", ajoutez l'URL de callback :
     ```
     http://localhost:3000/api/auth/discord/callback
     ```
   - Copiez le Client ID et Client Secret

2. **Configurer le `.env`** :
   ```env
   # Discord Bot
   DISCORD_TOKEN=votre_token_bot
   DISCORD_CLIENT_ID=votre_client_id
   DISCORD_CLIENT_SECRET=votre_client_secret
   DISCORD_CALLBACK_URL=http://localhost:3000/api/auth/discord/callback
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/la-machine
   
   # Sécurité
   JWT_SECRET=changez-cette-cle-secrete-jwt
   SESSION_SECRET=changez-cette-cle-session
   
   # Web Dashboard
   ENABLE_WEB_DASHBOARD=true
   WEB_PORT=3000
   FRONTEND_URL=http://localhost:3001
   ```

## 📦 Installation

### Prérequis

- Node.js 18+
- MongoDB (optionnel mais recommandé)
- Un bot Discord configuré

### Installation MongoDB (Mac)

```bash
brew install mongodb-community
brew services start mongodb-community
```

### Installation du projet

```bash
# Installer les dépendances
npm install

# Copier et configurer .env
cp .env.example .env
# Éditez .env avec vos clés
```

## 🚀 Démarrage

### Développement

```bash
# Tout lancer (bot + API + frontend)
npm run dev

# Ou séparément :
npm run dev:bot     # Bot Discord seulement
npm run dev:server  # API server seulement
npm run dev:web     # Frontend seulement
```

### Production

```bash
# Script automatique
./start-production.sh

# Ou manuellement
npm run build
npm run start:all
```

## 🌐 URLs d'accès

- **Frontend** : http://localhost:3001
- **API** : http://localhost:3000
- **Health Check** : http://localhost:3000/api/health

## 🔑 Fonctionnalités

### Authentification
- ✅ Login avec Discord OAuth2
- ✅ Récupération automatique des serveurs Discord
- ✅ Gestion des permissions (admin, modérateur, utilisateur)

### Gestion des Briefs
- ✅ Création/édition de briefs
- ✅ Publication directe vers Discord
- ✅ Suivi des soumissions
- ✅ Statistiques par brief

### Configuration Serveur
- ✅ Configuration par serveur Discord
- ✅ Planification automatique
- ✅ Paramètres IA personnalisables
- ✅ Templates de briefs

### Analytics
- ✅ Statistiques en temps réel
- ✅ Graphiques interactifs
- ✅ Leaderboard des contributeurs
- ✅ Métriques d'engagement

### Intégration Discord
- ✅ Récupération des vrais serveurs
- ✅ Liste des canaux et rôles
- ✅ Envoi de messages
- ✅ Gestion des membres

## 📊 Base de données

Le dashboard utilise MongoDB pour stocker :
- Utilisateurs et sessions
- Briefs et soumissions
- Configurations serveur
- Statistiques et analytics

### Collections MongoDB

- `users` : Utilisateurs du dashboard
- `briefs` : Tous les briefs créés
- `serverconfigs` : Configuration par serveur
- `sessions` : Sessions utilisateur

## 🛠️ API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/auth/discord` - Login Discord
- `GET /api/auth/discord/callback` - OAuth callback

### Protégés (nécessitent authentification)
- `GET/POST /api/briefs/*` - Gestion des briefs
- `GET/PUT /api/config/*` - Configuration serveur
- `GET /api/stats/*` - Statistiques
- `GET/POST /api/discord/*` - Intégration Discord

## 🔒 Sécurité

- **JWT** pour l'authentification API
- **Sessions** sécurisées avec cookies HttpOnly
- **Rate limiting** sur toutes les routes API
- **Helmet** pour les headers de sécurité
- **CORS** configuré pour le frontend uniquement
- **Validation** des données entrantes
- **Permissions** basées sur les rôles Discord

## 🐛 Dépannage

### Le CSS ne fonctionne pas
- Vérifiez que Tailwind est bien configuré dans `client/`
- Relancez `npm run dev:web`

### Erreur de connexion API
- Vérifiez que le serveur API est lancé (port 3000)
- Vérifiez MongoDB : `brew services list`
- Consultez les logs : `npm run dev:server`

### Discord OAuth ne fonctionne pas
- Vérifiez DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET
- Vérifiez l'URL de callback dans Discord et .env
- Assurez-vous que le bot est dans le serveur

### MongoDB non disponible
- Le dashboard fonctionne avec des données mockées si MongoDB n'est pas disponible
- Pour la production, MongoDB est recommandé

## 📝 Notes importantes

1. **Ne jamais commiter le fichier .env**
2. **Changer les clés JWT_SECRET et SESSION_SECRET en production**
3. **Utiliser HTTPS en production pour Discord OAuth**
4. **Le bot Discord doit être dans les serveurs à gérer**
5. **Les admins sont définis par ADMIN_USER_IDS dans .env**

## 🤝 Support

Pour toute question ou problème :
- Consultez les logs dans `logs/`
- Vérifiez la configuration dans `.env`
- Testez avec `/api/health`