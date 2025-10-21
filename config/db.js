const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../utils/logger.js');

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('❌ MONGO_URI non défini dans les variables d’environnement');
    }

    // console.log('Connexion à MongoDB avec URI:', mongoUri);
    logger.info('Connexion à MongoDB avec URI:', mongoUri);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ MongoDB connecté avec succès');
    // console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Échec de la connexion à MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
