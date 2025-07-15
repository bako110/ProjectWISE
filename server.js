import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import profileRoutes from './routes/profile.js';
import swaggerDocs from './swagger.js'; 

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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
