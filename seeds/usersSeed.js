// seeds/userSeed.js
const mongoose = require('mongoose');
const User = require('../models/users');

const MONGO_URI = 'mongodb://localhost:27017/ton_nom_de_bdd';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connecté à MongoDB pour le seed');

    const users = [
      {
        firstname: 'Admin',
        lastname: 'Super',
        email: 'admin@system.com',
        password: 'admin123',
        role: 'super_admin',
        agencyName: 'Central Agency',
        phone: '+22670000000',
        address: { city: 'Ouagadougou' },
      },
      {
        firstname: 'Collector',
        lastname: 'One',
        email: 'collector@demo.com',
        password: 'collector123',
        role: 'collector',
        agencyName: 'Agency 1',
        phone: '+22670000001',
        address: { city: 'Bobo-Dioulasso' },
      },
    ];

    await User.deleteMany(); // Vide la collection avant
    await User.insertMany(users);
    console.log('Seed terminé avec succès ✅');

    mongoose.connection.close();
  } catch (err) {
    console.error('Erreur de seed :', err);
    mongoose.connection.close();
  }
};

seedUsers();
