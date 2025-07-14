import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Configurations
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Import des routes
import authRoutes from './routes/authRoutes.js';

// Middleware routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
