import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <--- ⬅️ AJOUT ICI
import connectDB from './config/db.js';
import swaggerDocs from './swagger.js';

// Import des routes
import authRoutes from './routes/authRoutes.js';
import agencyRoutes from './routes/agency/agencyRoutes.js';
import superAdminRoutes from './routes/admin/superAdminRoutes.js';
import municipalityRoutes from './routes/mairies/municipalityRoutes.js';
import zoneRoutes from './routes/agency/zoneRoutes.js';
import profileRoutes from './routes/profile.js';
import agenceSearchRoutes from './routes/clients/agencySearchRoutes.js'
import agencyClientRoutes from './routes/clients/clientRoutes.js';
import agencyClientSubRoutes from './routes/agency/clientRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware CORS (autoriser toutes les origines, ou configurer)
app.use(cors({ origin: 'http://localhost:4200' }));

// Middlewares globaux
app.use(express.json());

// Documentation API Swagger
swaggerDocs(app);

// Déclaration des routes
app.use('/api/auth', authRoutes);
app.use('/api/agences', agencyRoutes);
app.use('/api/auth', superAdminRoutes);
app.use('/api/auth', municipalityRoutes);  // <-- Nouvelle route municipalité

app.use('/api/zones', zoneRoutes);
app.use('/api', profileRoutes);
// app.use('/api/plannings', planningRoutes);
app.use('/api/agences', agenceSearchRoutes);
app.use('/api/clients', agencyClientRoutes);
app.use('/api', agencyClientSubRoutes); // Routes pour les clients liés aux agences
// app.use('/api/clients', clientRoutes);

// Middleware 404 pour routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur', details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
