# 📋 Guide d'Utilisation - Système d'Équipes et Groupes de Clients

## 🎯 Vue d'Ensemble

Le nouveau système permet de :
- **Regrouper les collecteurs** en équipes avec un responsable
- **Regrouper les clients** en groupes 
- **Assigner des groupes de clients à des équipes**
- **Répartir automatiquement** les clients entre les membres de l'équipe

---

## 📁 Nouveaux Fichiers Créés

### Modèles
- `models/Team.js` - Équipes de collecteurs
- `models/ClientGroup.js` - Groupes de clients

### Schemas de Validation
- `schemas/Team.js`
- `schemas/ClientGroup.js`

### Services
- `services/team.js` - Gestion des équipes
- `services/clientGroup.js` - Gestion des groupes de clients

### Controllers
- `controllers/team.js`
- `controllers/clientGroup.js`

### Routes
- `routes/team.js` - Routes `/api/teams`
- `routes/clientGroup.js` - Routes `/api/client-groups`

### Modifications
- `models/planning.js` - Ajout de `teamId` et `clientGroupId`
- `services/planning.js` - Logique de répartition équitable
- `server.js` - Enregistrement des nouvelles routes

---

## 🚀 Guide d'Utilisation

### 1️⃣ Créer une Équipe de Collecteurs

```http
POST /api/teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Équipe A - Ouaga Centre",
  "agencyId": "65f1b2c3d4e5f6a7b8c9d0e1",
  "leaderId": "65f1b2c3d4e5f6a7b8c9d0e2",
  "collectors": [
    "65f1b2c3d4e5f6a7b8c9d0e3",
    "65f1b2c3d4e5f6a7b8c9d0e4",
    "65f1b2c3d4e5f6a7b8c9d0e5"
  ],
  "zones": ["Ouaga 2000", "Kalgondin", "Zone du Bois"],
  "maxClientsPerDay": 60,
  "description": "Équipe principale pour le centre ville"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Équipe créée avec succès",
  "data": {
    "_id": "65f1b2c3d4e5f6a7b8c9d0f1",
    "name": "Équipe A - Ouaga Centre",
    "leaderId": {...},
    "collectors": [...],
    "status": "active",
    "createdAt": "2026-03-12T10:00:00.000Z"
  }
}
```

---

### 2️⃣ Créer un Groupe de Clients

#### Option A: Création manuelle

```http
POST /api/client-groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Groupe 1 - Ouaga 2000",
  "agencyId": "65f1b2c3d4e5f6a7b8c9d0e1",
  "clients": [
    "65f1b2c3d4e5f6a7b8c9d0e6",
    "65f1b2c3d4e5f6a7b8c9d0e7",
    "65f1b2c3d4e5f6a7b8c9d0e8"
  ],
  "zone": "Ouaga 2000",
  "teamId": "65f1b2c3d4e5f6a7b8c9d0f1"
}
```

#### Option B: Création automatique depuis une zone

```http
POST /api/client-groups/from-zone
Authorization: Bearer {token}
Content-Type: application/json

{
  "agencyId": "65f1b2c3d4e5f6a7b8c9d0e1",
  "zone": "Ouaga 2000",
  "groupName": "Groupe Auto - Ouaga 2000",
  "teamId": "65f1b2c3d4e5f6a7b8c9d0f1"
}
```

**Cela créera automatiquement un groupe avec TOUS les clients de la zone "Ouaga 2000".**

---

### 3️⃣ Assigner un Groupe à une Équipe

```http
POST /api/client-groups/{groupId}/assign-team
Authorization: Bearer {token}
Content-Type: application/json

{
  "teamId": "65f1b2c3d4e5f6a7b8c9d0f1"
}
```

---

### 4️⃣ Créer un Planning avec une Équipe

#### Option A: Planning avec équipe (recommandé)

```http
POST /api/planning
Authorization: Bearer {token}
Content-Type: application/json

{
  "managerId": "65f1b2c3d4e5f6a7b8c9d0e2",
  "agencyId": "65f1b2c3d4e5f6a7b8c9d0e1",
  "teamId": "65f1b2c3d4e5f6a7b8c9d0f1",
  "clientGroupId": "65f1b2c3d4e5f6a7b8c9d0f2",
  "zone": "Ouaga 2000",
  "date": "2026-03-15",
  "startTime": "08:00",
  "endTime": "14:00",
  "pricingId": "65f1b2c3d4e5f6a7b8c9d0e9"
}
```

**Résultat:**
- Le système récupère automatiquement les collecteurs de l'équipe
- Les clients du groupe sont répartis équitablement entre les collecteurs
- Exemple: 90 clients, 3 collecteurs → 30 clients chacun

#### Option B: Planning classique (ancien système, toujours compatible)

```http
POST /api/planning
Authorization: Bearer {token}
Content-Type: application/json

{
  "managerId": "65f1b2c3d4e5f6a7b8c9d0e2",
  "agencyId": "65f1b2c3d4e5f6a7b8c9d0e1",
  "collectors": [
    "65f1b2c3d4e5f6a7b8c9d0e3",
    "65f1b2c3d4e5f6a7b8c9d0e4"
  ],
  "zone": "Ouaga 2000",
  "date": "2026-03-15",
  "startTime": "08:00",
  "endTime": "14:00",
  "pricingId": "65f1b2c3d4e5f6a7b8c9d0e9"
}
```

**Résultat:**
- Les clients seront répartis équitablement entre les 2 collecteurs
- Plus besoin de créer une équipe si vous voulez juste une répartition équitable

---

## 📊 Endpoints Disponibles

### Équipes (Teams)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/teams` | Créer une équipe |
| GET | `/api/teams/agency/:agencyId` | Liste des équipes d'une agence |
| GET | `/api/teams/:teamId` | Détails d'une équipe |
| GET | `/api/teams/:teamId/stats` | Statistiques d'une équipe |
| PUT | `/api/teams/:teamId` | Modifier une équipe |
| DELETE | `/api/teams/:teamId` | Supprimer une équipe |

### Groupes de Clients (Client Groups)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/client-groups` | Créer un groupe |
| POST | `/api/client-groups/from-zone` | Créer depuis une zone |
| GET | `/api/client-groups/agency/:agencyId` | Liste des groupes d'une agence |
| GET | `/api/client-groups/team/:teamId` | Groupes d'une équipe |
| GET | `/api/client-groups/:groupId` | Détails d'un groupe |
| PUT | `/api/client-groups/:groupId` | Modifier un groupe |
| POST | `/api/client-groups/:groupId/assign-team` | Assigner à une équipe |
| POST | `/api/client-groups/:groupId/unassign-team` | Retirer de l'équipe |
| POST | `/api/client-groups/:groupId/add-clients` | Ajouter des clients |
| POST | `/api/client-groups/:groupId/remove-clients` | Retirer des clients |
| DELETE | `/api/client-groups/:groupId` | Supprimer un groupe |

---

## 🔄 Flux de Travail Recommandé

### Scénario: Gérer 300 clients dans 3 zones

1. **Créer 3 équipes** (une par zone)
   - Équipe A: Ouaga 2000 (3 collecteurs)
   - Équipe B: Kalgondin (3 collecteurs)
   - Équipe C: Zone du Bois (2 collecteurs)

2. **Créer 3 groupes de clients** (automatiques depuis zones)
   ```http
   POST /api/client-groups/from-zone
   {
     "agencyId": "...",
     "zone": "Ouaga 2000",
     "groupName": "Groupe Ouaga 2000",
     "teamId": "{equipeA_id}"
   }
   ```

3. **Créer les plannings**
   ```http
   POST /api/planning
   {
     "teamId": "{equipeA_id}",
     "clientGroupId": "{groupeOuaga2000_id}",
     "zone": "Ouaga 2000",
     "date": "2026-03-15",
     ...
   }
   ```

**Résultat:**
- 100 clients Ouaga 2000 → répartis sur 3 collecteurs (33-33-34)
- 120 clients Kalgondin → répartis sur 3 collecteurs (40-40-40)
- 80 clients Zone du Bois → répartis sur 2 collecteurs (40-40)

---

## ✨ Améliorations Apportées

### AVANT
```
❌ Tous les clients assignés au premier collecteur
❌ Surcharge d'un seul collecteur
❌ Pas de gestion d'équipes
❌ Difficile de gérer 100+ clients
```

### APRÈS
```
✅ Répartition équitable automatique
✅ Gestion structurée par équipes
✅ Groupes de clients organisés
✅ Facilement scalable (1000+ clients)
✅ Responsable par équipe
✅ Statistiques par équipe
```

---

## 🛠️ Exemples Avancés

### Ajouter des clients à un groupe existant

```http
POST /api/client-groups/{groupId}/add-clients
{
  "clientIds": [
    "65f1b2c3d4e5f6a7b8c9d0ea",
    "65f1b2c3d4e5f6a7b8c9d0eb"
  ]
}
```

### Obtenir les statistiques d'une équipe

```http
GET /api/teams/{teamId}/stats
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "teamId": "...",
    "teamName": "Équipe A - Ouaga Centre",
    "collectorsCount": 3,
    "clientGroups": 2,
    "totalClients": 150,
    "activePlannings": 5,
    "collectesThisMonth": 450
  }
}
```

---

## 🔐 Sécurité

Toutes les routes nécessitent l'authentification via token JWT:
```
Authorization: Bearer {votre_token}
```

---

## 📝 Notes Importantes

1. **Un client peut-il être dans plusieurs groupes?**
   - Oui, mais non recommandé pour éviter la confusion

2. **Un groupe peut-il changer d'équipe?**
   - Oui, utilisez l'endpoint `assign-team`

3. **L'ancien système fonctionne-t-il toujours?**
   - Oui! Vous pouvez toujours créer des plannings sans équipe ni groupe
   - La répartition équitable fonctionne aussi avec des collecteurs manuels

4. **Que se passe-t-il si je supprime une équipe?**
   - L'équipe est supprimée mais les groupes restent (teamId = null)
   - Les plannings existants ne sont pas affectés

---

## 🐛 Dépannage

### Erreur: "collectors doit être un tableau non vide"

**Solution:** Ajoutez soit `collectors: [...]` soit `teamId: "..."`

### Erreur: "Équipe non trouvée"

**Solution:** Vérifiez que l'ID de l'équipe existe et est correct

### Aucun client trouvé

**Solution:** 
- Vérifiez que les clients ont `status: 'active'`
- Vérifiez que `address.neighborhood` correspond à la zone
- Utilisez l'endpoint `/from-zone` pour créer automatiquement

---

## 📞 Support

Pour toute question ou problème, consultez les logs avec:
```bash
tail -f logs/log.1.txt
```

Les logs détaillés montrent:
- Création des équipes
- Répartition des clients
- Erreurs détaillées

---

**Date de création:** 12 Mars 2026  
**Version:** 1.0.0
