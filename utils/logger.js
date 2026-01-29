// const pino = require('pino');

// const logger = pino({
//   transport: {
//     target: 'pino-pretty', // active seulement en développement
//     options: {
//       colorize: true,
//       translateTime: 'SYS:standard',
//       ignore: 'pid,hostname',
//     },
//   },
// });

// module.exports = logger;

const pino = require('pino');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const targets = [
  // Console pretty en développement
  ...(!isProduction ? [{
    target: 'pino-pretty',
    level: 'info',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  }] : []),
  
  // Fichier avec rotation
  {
    target: 'pino-roll',
    level: 'info',
    options: {
      file: path.join(__dirname, '..', 'logs', 'log.txt'),
      frequency: 'daily', // Rotation quotidienne
      size: '10m', // Ou rotation à 10MB
      mkdir: true, // Créer le dossier automatiquement
    },
  },
  
  // Fichier séparé pour les erreurs
  {
    target: 'pino-roll',
    level: 'error',
    options: {
      file: path.join(__dirname, '..', 'logs', 'error.txt'),
      frequency: 'daily',
      mkdir: true,
    },
  },
];

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets,
  },
});

module.exports = logger;
