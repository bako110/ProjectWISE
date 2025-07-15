import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI);
    // await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Échec de la connexion à MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
