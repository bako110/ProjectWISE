import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import swaggerDocs from './swagger.js';

import { generateDictionary } from './generator.js';
import fs from 'fs';
import { exportPDF } from './exportPDF.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import agencyRoutes from './routes/agency/agencyRoutes.js';
import superAdminRoutes from './routes/admin/superAdminRoutes.js';
import municipalityRoutes from './routes/mairies/municipalityRoutes.js';
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
import zoneRoutes from './routes/agency/zoneRoutes.js';
import upload from './routes/upload.js';
import './cron/subscriptionChecker.js';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'https://collect-dechets.vercel.app',
  'http://localhost:4200'
];

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Swagger
swaggerDocs(app);

// --- ROUTES API EXISTANTES ---
app.use('/api/auth', authRoutes);
app.use('/api/agences', agencyRoutes);
app.use('/api/auth', superAdminRoutes);
app.use('/api/auth', municipalityRoutes);
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
app.use('/api/zones', zoneRoutes);
app.use('/api', neighborhoodRoutes);
app.use('/api', sectorRoute);
app.use('/api', arrondissementRoute);
app.use('/api', cityRoute);
app.use('/api', walletRoute);
app.use('/api', subscriptionRoute);
app.use('/api', messageRoute);
app.use('/api', notificationRoute);
app.use('/api', upload);

// --- ROUTES DICTIONNAIRE ---
// JSON
app.get('/dictionary', async (req, res) => {
  try {
    await generateDictionary();
    const dictionary = JSON.parse(fs.readFileSync('./dictionary.json', 'utf-8'));
    res.json(dictionary);
  } catch (err) {
    res.status(500).json({ error: 'Erreur génération dictionnaire', details: err.message });
  }
});

// PDF
app.get('/dictionary/pdf', async (req, res) => {
  try {
    await generateDictionary();
    await exportPDF(); // attendre que le PDF soit créé
    const filePath = './dictionary.pdf';
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(500).json({ error: 'PDF non généré' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erreur génération PDF', details: err.message });
  }
});

// --- 404 (après toutes les routes) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// --- Middleware erreurs ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur', details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
