# 🌬️ IQAir Dashboard

Application web standalone affichant la qualité de l'air intérieur/extérieur via votre capteur IQAir.

---

## Prérequis

- [Node.js](https://nodejs.org) **v18+**
- npm (inclus avec Node.js)

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev
```

L'app est disponible sur **http://localhost:5173**

---

## Configuration des identifiants IQAir

### Option A — Via l'interface (recommandée)

Au premier lancement, un panneau de configuration s'ouvre automatiquement.  
Renseignez :
- **User ID** — votre identifiant utilisateur IQAir
- **Device ID** — l'identifiant de votre capteur
- **Token API** — votre token d'authentification

Ces données sont sauvegardées dans le **localStorage** du navigateur.  
Cliquez ⚙️ en haut à droite pour y accéder à nouveau.

### Option B — Via fichier `.env`

Copiez `.env.example` en `.env` et renseignez les valeurs :

```
VITE_IQAIR_USER_ID=your_user_id
VITE_IQAIR_DEVICE_ID=your_device_id
VITE_IQAIR_TOKEN=your_token
```

**Où trouver ces informations ?**  
→ Connectez-vous sur [iqair.com](https://www.iqair.com) › Mon compte › Mes appareils › API

---

## Build de production

```bash
npm run build
```

Les fichiers statiques sont générés dans `dist/`.  
Pour les servir :

```bash
npm run preview
```

### Déploiement

Le dossier `dist/` peut être déployé sur n'importe quel hébergeur statique :
- **Netlify** : glisser-déposer le dossier `dist/`
- **Vercel** : `vercel --prod`
- **GitHub Pages**, Nginx, Apache…

> ⚠️ En production, le proxy `/iqair-api` configuré dans `vite.config.ts` ne fonctionne qu'en développement.  
> Pour la production, vous devrez soit déployer un reverse proxy (Nginx, Caddy…), soit utiliser un backend intermédiaire pour éviter les erreurs CORS.

---

## Structure du projet

```
iqair-app/
├── src/
│   ├── components/
│   │   └── AirQualityWidget.vue   # Widget principal (fidèle à l'original)
│   ├── stores/
│   │   └── usePlugin_meteoIQAirApiStore.ts  # Store Pinia IQAir
│   ├── App.vue                    # Shell de l'app (topbar + config panel)
│   ├── main.ts                    # Point d'entrée
│   └── style.css                  # Variables CSS globales + Tailwind
├── .env                           # Identifiants (non commité)
├── .env.example                   # Template à copier
├── vite.config.ts                 # Config Vite + proxy API
├── tailwind.config.js
└── package.json
```

---

## Fonctionnalités

- 🌡️ Température intérieure/extérieure
- 💧 Humidité intérieure/extérieure
- 🌫️ Particules PM2.5 intérieure/extérieure
- 🍃 CO₂ intérieur
- 🎯 Score global de qualité de l'air (algorithme adaptatif saison chauffe/hors chauffe)
- 🔄 Actualisation automatique toutes les 5 minutes
- 💾 Cache localStorage pour afficher les dernières données même hors ligne
- 📐 Interface responsive (adaptatif à la taille de la fenêtre)
