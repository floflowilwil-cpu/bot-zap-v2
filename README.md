# 🤖 WhatsApp Bot — Multifonctions

Bot WhatsApp connecté à un numéro personnel, avec IA, météo, news, gestion de groupes et multimédia.

## ✨ Fonctionnalités

| Commande | Description |
|---|---|
| `!aide` | Affiche le menu complet |
| `!meteo [ville]` | Météo en temps réel |
| `!news [sujet]` | Top 5 actualités |
| `!ai [question]` | Chat avec Claude AI (historique de conversation) |
| `!calc [expression]` | Calculatrice scientifique |
| `!tagall [message]` | Tag tous les membres du groupe (admin) |
| `!info` | Infos du groupe |
| `!kick @membre` | Expulse un membre (admin) |
| `!sticker` | Convertit une image en sticker |

> ⏳ Chaque commande réagit automatiquement avec un emoji de chargement, puis ✅ ou ❌ selon le résultat.

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/TON_USERNAME/whatsapp-bot.git
cd whatsapp-bot
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplis `.env` avec tes clés API :

```env
ANTHROPIC_API_KEY=...   # https://console.anthropic.com
OPENWEATHER_API_KEY=... # https://openweathermap.org/api
NEWS_API_KEY=...        # https://newsapi.org
ADMIN_NUMBER=237XXXXXXXXX
```

### 4. Lancer le bot

```bash
npm start
```

Un QR code s'affichera. Scanne-le avec WhatsApp (**Appareils liés**).

---

## ☁️ Déploiement (Railway)

1. Push le code sur GitHub
2. Va sur [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Ajoute les variables d'environnement dans les **Settings → Variables**
4. Le bot tourne 24h/24 automatiquement

> ⚠️ Pour Railway, Puppeteer nécessite des buildpacks Chrome. Ajoute dans les settings :
> `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` et utilise `chromium-browser` système.

---

## 📁 Structure du projet

```
whatsapp-bot/
├── src/
│   ├── index.js              # Point d'entrée principal
│   ├── handlers/
│   │   ├── messageHandler.js # Router des commandes
│   │   └── groupHandler.js   # Événements de groupe
│   ├── commands/
│   │   ├── help.js           # Menu d'aide
│   │   ├── meteo.js          # Météo
│   │   ├── news.js           # Actualités
│   │   ├── ai.js             # Claude AI
│   │   ├── calc.js           # Calculatrice
│   │   ├── group.js          # Gestion de groupe
│   │   └── media.js          # Stickers / multimédia
│   └── utils/
│       └── constants.js      # Constantes globales
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 APIs utilisées

- **Anthropic Claude** — Intelligence artificielle
- **OpenWeatherMap** — Données météo (gratuit)
- **NewsAPI** — Actualités (gratuit jusqu'à 100 req/jour)

---

## ⚠️ Avertissement

Ce bot utilise `whatsapp-web.js`, une bibliothèque non officielle. L'utilisation de bots WhatsApp non officiels peut violer les conditions d'utilisation de WhatsApp. Utilise-le de façon responsable.
