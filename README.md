# ProjectWISE
🚀 Installation et Configuration
Prérequis
Node.js >= v22.14.0

npm >= 10.9.2

MongoDB >= 5.x


Variables d'Environnement
                        Les variables suivantes doivent être configurées dans le fichier .env :

                        Configuration base de données (MongoDB + Redis)

                        Clés JWT pour l'authentification

                        Clés API pour les services externes (Google Maps, Stripe, Firebase)

                        Identifiants pour les services email/SMS (SendGrid, Twilio)

📁 Structure du Projet
L'architecture suit le pattern MVC avec une organisation modulaire :

                        config/ : Configuration des services externes

                        controllers/ : Logique métier des endpoints

                        middleware/ : Middlewares d'authentification et validation

                        models/ : Schémas Mongoose

                        routes/ : Définition des routes API

                        services/ : Couche service pour la logique complexe

                        utils/ : Helpers et utilitaires

                        seeds/ : Données initiales

🛠️ Stack Technique
                    Backend
                    Framework : Express.js

                    ODM : Mongoose pour MongoDB

                    Cache : Redis

                    Authentification : JWT + bcrypt

                    Validation : Joi / express-validator

                    Documentation : Swagger/OpenAPI

🗄 Modèles de Données Principaux
User
Gère les comptes utilisateurs avec différents rôles :

        admin_agency

        collector

        client

        municipal

        Champs importants :

                    email/password

                    role

                    address avec géolocalisation

                    agencyId pour le rattachement

                    Agency
        Représente les agences de collecte :

                    Informations légales (license)

                    Zones de couverture (GeoJSON)

                    Services proposés

                    Administrateur rattaché

                    Collection
        Gère les collectes de déchets :

                    Client/Agence/Collecteur associés

                    Dates programmée/réelle

                    Statut de progression

                    Type de déchets

                    Localisation précise

        Payment
                    Suivi des paiements :

                    Montant et devise

                    Méthode de paiement

                    Statut

                    Période d'abonnement le cas échéant

🔌 Points d'Accès API
Les endpoints sont organisés par domaine :

                    Authentification : login/register/refresh/etc.

                    Agences : CRUD + gestion employés/zones

                    Collectes : Planification/suivi/signalement

                    Utilisateurs : Profil/historique/abonnements

🔒 Sécurité
                        Authentification via JWT

                        Hashing des mots de passe avec bcrypt

                        Middleware d'autorisation par rôles

                        Validation stricte des entrées

                        Protection des headers avec helmet

📊 Base de Données
                        Index optimisés pour les requêtes géospatiales

                        Scripts de seeding pour les données initiales

                        Configuration Redis pour le cache

                        Sauvegarde automatique des données

🚀 Déploiement
                        Configuration Docker et Docker-compose

                        Scripts NPM pour les différentes environnements

                        Variables d'environnement par contexte

🔧 Monitoring
                        Logging structuré avec Winston

                        Health checks pour les dépendances

                        Rotation et compression automatique des logs

🛠 Maintenance
                        Scripts de sauvegarde/restauration

                        Nettoyage automatique des logs

                        Commandes utiles pour l'administration

                        Tests unitaires et d'intégration

🔄 Workflow de Développement
                        ESLint pour la qualité de code

                        Tests automatisés avec Jest

                        Audit de sécurité intégré

                        Couverture de code

Dernière mise à jour : 15/06/2025