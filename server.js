import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import swaggerDocs from './swagger.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import agencyRoutes from './routes/agency/agencyRoutes.js';
import superAdminRoutes from './routes/admin/superAdminRoutes.js';
import municipalityRoutes from './routes/mairies/municipalityRoutes.js';
// import zoneRoutes from './routes/agency/zoneRoutes.js';
import profileRoutes from './routes/profile.js';
import agenceSearchRoutes from './routes/clients/agencySearchRoutes.js';
import agencyClientRoutes from './routes/clients/clientRoutes.js';
import agencyClientSubRoutes from './routes/agency/clientRoutes.js';
import planningRoutes from './routes/agency/planningRoutes.js';
import scanRoutes from './routes/agency/scanRoutes.js';
import collecteRoutes from './routes/agency/scanRoutes.js';
import payment from './routes/paymentRoute.js';
import serviceRoute from './routes/admin/serviceRoute.js';
import reportRoutes from './routes/report/reportRoutes.js';
import neighborhoodRoutes from './routes/adresse/neighbordhoodRoute.js';
import sectorRoute from "./routes/adresse/sectorRoute.js";
import arrondissementRoute from "./routes/adresse/arrondissementRoute.js";
import cityRoute from "./routes/adresse/cityRoute.js";
import walletRoute from "./routes/walletRoute.js";
import subscriptionRoute from "./routes/subscriptionRoute.js";
import messageRoute from './routes/messageRoute.js';
import notificationRoute from './routes/notificationRoute.js';

import './cron/subscriptionChecker.js';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'https://collect-dechets.vercel.app',
  'http://localhost:4200',
  'hhtp://localhost:3000'
];

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware JSON
app.use(express.json());

// Swagger
swaggerDocs(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agences', agencyRoutes);
app.use('/api/auth', superAdminRoutes);
app.use('/api/auth', municipalityRoutes);
// app.use('/api/zones', zoneRoutes);
app.use('/api', profileRoutes);
app.use('/api/zones/plannings', planningRoutes);
app.use('/api/agences', agenceSearchRoutes);
app.use('/api/clients', agencyClientRoutes);
app.use('/api/clients', agencyClientSubRoutes);
app.use('/api/agences', agencyClientSubRoutes);
app.use('/api/collecte', scanRoutes); 
app.use('/api/collecte', collecteRoutes);
app.use('/api/payments', payment);
app.use('/api/services', serviceRoute);
app.use('/api/reports', reportRoutes);
app.use('/api', neighborhoodRoutes);
app.use('/api', sectorRoute);
app.use('/api', arrondissementRoute);
app.use('/api', cityRoute);
app.use('/api', walletRoute);
app.use('/api', subscriptionRoute);
app.use('/api', messageRoute);
app.use('/api', notificationRoute);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur', details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
