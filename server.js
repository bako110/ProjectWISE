import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import swaggerDocs from './swagger.js';



dotenv.config();
connectDB();

const app = express();

;


app.use(cors({
  origin: '*',           
  credentials: true,    
}));


app.use(express.json());

swaggerDocs(app);







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
