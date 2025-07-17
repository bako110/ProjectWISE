import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import swaggerDocs from './swagger.js';


// Import des routes
import authRoutes from './routes/authRoutes.js';
import collectorRoutes from './routes/collectors/collectorRoutes.js';
import profileRoutes from './routes/profile.js';
import zoneRoutes from './routes/agency/zoneRoutes.js';  
import planningRoutes from './routes/agency/planningRoutes.js';
import agencyClientRoutes from './routes/agency/clientRoutes.js' ;
import clientRoutes from './routes/clients/clientRoutes.js'
import agenceSearchRoutes from './routes/clients/agencySearchRoutes.js'

// Configurations et connexion à la base
dotenv.config();
connectDB();

const app = express();

// Middlewares globaux
app.use(express.json());

// Documentation API Swagger
swaggerDocs(app);

// Déclaration des routes
app.use('/api/auth', authRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/zones', zoneRoutes);   // <-- route Zones
app.use('/api', profileRoutes);
app.use('/api/plannings', planningRoutes);
app.use('/api/agences', agenceSearchRoutes);
app.use('/api', agencyClientRoutes);
app.use('./api/clients', clientRoutes);


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
