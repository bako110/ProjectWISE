const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../utils/logger.js');

dotenv.config();

const connectDB = async () => {
  try {
    // Essayer MongoDB Atlas d'abord
    let mongoUri = process.env.MONGO_URI || "mongodb+srv://bdbasedonne:EImh6ZOSTFg99Fh7@cluster0.qnoikwi.mongodb.net/new";
    
    // Alternative : URI de test MongoDB Atlas gratuit
    // let mongoUri = "mongodb+srv://test:test@cluster0.mongodb.net/test";
    
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
    console.error('❌ Échec de la connexion à MongoDB Atlas:', error.message);
    
    // Essayer MongoDB Local en fallback
    try {
      const localUri = "mongodb://127.0.0.1:27017/new";
      console.log('🔄 Tentative de connexion à MongoDB Local...');
      logger.info('Tentative de connexion à MongoDB Local:', localUri);
      
      await mongoose.connect(localUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('✅ MongoDB Local connecté avec succès');
      logger.info('✅ MongoDB Local connecté avec succès');
      
    } catch (localError) {
      console.error('❌ Échec de la connexion à MongoDB Local aussi:', localError.message);
      logger.error('❌ Échec de la connexion à MongoDB Local aussi:', localError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
