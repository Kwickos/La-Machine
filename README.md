# 🤖 La Machine - Discord Bot

Bot Discord intelligent pour le serveur **"La Fabrique"** qui génère automatiquement des briefs créatifs pour stimuler la communauté de designers et créatifs.

## ✨ Fonctionnalités

- 📋 **Génération automatique de briefs créatifs** via OpenAI GPT-4
- ⏰ **Planification automatique** avec renouvellement des briefs expirés
- 💾 **Persistance complète** des briefs et configurations (redémarrage-safe)
- 🚨 **Système d'alertes** pour l'admin en cas d'erreur
- ⚙️ **Configuration par serveur** (canal, durée, langue)
- 📊 **Gestion avancée** des briefs actifs et expirés

## 🚀 Installation

### Prérequis

- Node.js >= 18.0.0
- NPM ou Yarn
- Un bot Discord configuré
- Une clé API OpenAI (recommandé)

### 1. Cloner le projet

```bash
git clone <repository-url>
cd la-machine
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Copiez le fichier d'exemple et configurez vos variables :

```bash
cp .env.example .env
```

Éditez le fichier `.env` :

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# Admin Configuration
ADMIN_USER_ID=your_discord_user_id_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Logging
LOG_LEVEL=info
```

### 4. Compilation et démarrage

```bash
# Compiler le TypeScript
npm run build

# Démarrer le bot
npm start

# Ou en mode développement
npm run dev
```

## 🎮 Commandes Discord

### `/brief`
Gère les briefs créatifs du serveur.

#### Sous-commandes :

- **`/brief new`** - Crée un nouveau brief
  - `days` (optionnel) : Durée en jours (1-14)
  - `channel` (optionnel) : Canal où envoyer le brief

- **`/brief active`** - Affiche les briefs actifs

- **`/brief complete`** - Marque un brief comme terminé
  - `id` (requis) : ID du brief à terminer

### `/config`
Configure les paramètres du serveur.

#### Sous-commandes :

- **`/config set`** - Modifier un paramètre
  - `setting` : Paramètre à modifier
  - `value` : Nouvelle valeur

- **`/config show`** - Afficher la configuration actuelle

#### Paramètres disponibles :

- `brief_channel` : Canal pour les briefs automatiques
- `brief_duration` : Durée par défaut (en heures)
- `auto_generate` : Génération automatique (true/false)
- `language` : Langue des briefs (fr/en)

## 📁 Structure du projet

```
la-machine/
├── src/
│   ├── commands/          # Commandes Discord
│   │   ├── brief.ts
│   │   └── config.ts
│   ├── modules/
│   │   ├── ai/           # Génération IA des briefs
│   │   ├── briefs/       # Gestion des briefs
│   │   ├── config/       # Configuration serveurs
│   │   └── scheduler/    # Planificateur automatique
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires (logs, alertes)
│   └── index.ts          # Point d'entrée
├── data/                 # Données persistantes
│   └── active-briefs.json
├── config/               # Configurations serveurs
│   └── servers.json
├── dist/                 # Code compilé
└── package.json
```

## 🔧 Configuration avancée

### Planification automatique

Le bot vérifie automatiquement :
- **Toutes les heures** : Briefs expirés à renouveler
- **10h00 quotidien** : Génération de nouveaux briefs (si activé)

### Persistance des données

- **Briefs actifs** : Sauvés dans `data/active-briefs.json`
- **Configurations** : Sauvées dans `config/servers.json`
- **Logs** : `combined.log` et `error.log`

### Gestion d'erreurs

En cas d'échec de génération de brief :
1. ❌ Aucun brief de fallback n'est créé
2. 🚨 L'admin reçoit une alerte par message privé Discord
3. 📝 L'erreur est loggée pour débuggage

## 🚀 Déploiement

### Avec les scripts fournis

**Linux/macOS :**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows :**
```cmd
deploy.bat
```

### Déploiement manuel

```bash
npm run build
npm start
```

## 📊 Monitoring

### Logs

Le bot utilise Winston pour les logs :
- **Console** : Logs colorés en développement
- **combined.log** : Tous les logs
- **error.log** : Erreurs uniquement

### Alertes Admin

L'admin configuré reçoit des messages privés Discord pour :
- Échecs de génération de briefs
- Erreurs critiques du système
- Problèmes de configuration

## 🔒 Sécurité

- ✅ Variables sensibles dans `.env`
- ✅ `.env` exclu du contrôle de version
- ✅ Validation des entrées utilisateur
- ✅ Gestion d'erreurs sans exposition d'informations sensibles

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues GitHub** : Pour reporter des bugs ou demander des fonctionnalités
- **Discord** : Contactez l'admin du serveur pour une assistance directe

---

⚡ Créé avec passion pour la communauté créative de **La Fabrique** ⚡