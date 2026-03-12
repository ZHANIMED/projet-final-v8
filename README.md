# 🌿 EcoDeco - Plateforme E-commerce Éco-responsable

EcoDeco est une plateforme e-commerce moderne conçue pour offrir une expérience d'achat fluide, intelligente et personnalisée. Le projet intègre des fonctionnalités avancées telles qu'un chatbot IA, un tableau de bord administrateur complet et des notifications en temps réel.

---

## 🚀 Fonctionnalités Clés

### 👤 Espace Utilisateur
- **Navigation Intuitive** : Parcourez les produits par catégories avec un design épuré.
- **Chatbot Intelligent** : Assistant virtuel propulsé par **Google Gemini AI** pour répondre à vos questions sur les produits.
- **Gestion du Panier** : Système de panier dynamique synchronisé localement et avec le compte utilisateur.
- **Profil & Commandes** : Historique des commandes, téléchargement de factures au format PDF et gestion du profil.
- **Réductions** : Système de coupons de réduction intégrés lors du passage en caisse.
- **Newsletter** : Inscription pour recevoir les dernières offres.

### 🔐 Espace Administration
- **Tableau de Bord** : Statistiques détaillées sur les ventes, les produits les plus vendus et les nouveaux utilisateurs.
- **Gestion du Catalogue** : CRUD complet pour les produits et les catégories (avec upload d'images via Cloudinary).
- **Gestion des Commandes** : Suivi du statut des commandes et gestion des expéditions.
- **Modération** : Système de gestion des avis clients et des messages reçus.
- **Marketing** : Création et gestion de codes promos (coupons).
- **Contrôle du Site** : Modification des paramètres globaux (bannières, textes, pages dynamiques).

---

## 🛠️ Stack Technique

### Backend
- **Node.js & Express** : Serveur API robuste et scalable.
- **MongoDB & Mongoose** : Base de données NoSQL pour une gestion flexible des données.
- **Socket.io** : Communication bidirectionnelle en temps réel pour les notifications.
- **Google Gemini AI** : Intégration de l'IA pour le support client.
- **Cloudinary** : Stockage et optimisation des images dans le cloud.
- **JWT & Bcrypt** : Authentification sécurisée et hachage des mots de passe.

### Frontend
- **React 19** : Interface utilisateur moderne et réactive.
- **Redux Toolkit** : Gestion d'état globale centralisée.
- **React Router 7** : Navigation fluide sans rechargement de page.
- **Recharts** : Visualisation de données pour le dashboard admin.
- **React Toastify** : Notifications UI élégantes.

---

## 📦 Installation et Configuration

### Prérequis
- Node.js (v16+)
- Compte MongoDB (Atlas ou Local)
- Clés API : Cloudinary, Google Gemini

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd projet-final
```

### 2. Configuration du Backend
Créez un fichier `.env` à la racine du projet :
```env
PORT=5000
MONGO_URI=vos_identifiants_mongodb
JWT_SECRET=votre_secret_jwt
CLOUD_NAME=votre_cloud_name
CLOUD_API_KEY=votre_api_key
CLOUD_API_SECRET=votre_api_secret
GEMINI_API_KEY=votre_cle_gemini
CLIENT_URL=http://localhost:3000
```
Installez les dépendances et lancez le serveur :
```bash
npm install
npm run dev
```

### 3. Configuration du Frontend
Allez dans le dossier client et installez les dépendances :
```bash
cd client
npm install
npm start
```
L'application sera disponible sur `http://localhost:3000`.

---

## 📝 Licence
Ce projet est réalisé dans un cadre de développement professionnel/éducatif. Tous droits réservés.
