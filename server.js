import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import profileRoutes from './routes/profile.js';
import swaggerDocs from './swagger.js'; 
import publicIp from 'public-ip';  // <-- import public-ip

// Configurations
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
swaggerDocs(app);

// Import des routes
import authRoutes from './routes/authRoutes.js';
import collectorRoutes from './routes/collectorRoutes.js'; 

// Middleware routes
app.use('/api/auth', authRoutes);
app.use('/api/collectors', collectorRoutes);  
app.use('/api', profileRoutes);

// Nouvelle route pour afficher l'IP publique de Render
app.get('/myip', async (req, res) => {
  try {
    const ip = await publicIp.v4();  // récupère IP publique IPv4
    res.send(`IP publique de ce serveur : ${ip}`);
  } catch (error) {
    res.status(500).send('Impossible de récupérer l\'IP publique');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
