const express = require('express');
const dotenv = require('dotenv');
const logger = require('./utils/logger.js');
const cors = require('cors');
const connectDB = require('./config/db.js');
const swaggerDocs = require('./swagger.js');
const scheduleSubscriptionCancellation = require('./services/subscriptionScheduler.js');
const { initPlanningScheduler } = require('./jobs/planningScheduler.js');

// Import des routes
const authRoute = require('./routes/auth.route.js');
const userRoute = require('./routes/userRoute.js');
const agencyRoute = require('./routes/agencyRoute.js');
const agencySearchRoute = require('./routes/agencySearchRoute.js');
const agencyValidationRoute = require('./routes/superAdminValidateAgencyRoutes.js');
const agencyEmployeeRoute = require('./routes/agencyEmployeeRoute.js');
const pricingAgencyRoute = require('./routes/pricingAgencyRoute.js');
const walletRoute = require('./routes/walletRoute.js');
const subscriptionRoute = require('./routes/subscriptioRoute.js');
const planning = require('./routes/planning.js');
const messageRoute = require('./routes/message.route.js');
const notificationRoute = require('./routes/notification.route.js');
const globalStateRoutes = require('./routes/globalStateRoutes.js');
const qrValidationRoute = require('./routes/qrcodeValidationRoute.js');
const stateForAgencyRoute = require ('./routes/stateForAgencyRoute.js');
const collecteRoute = require ('./routes/collecte.route.js');
const transactionRoute = require ('./routes/transaction.js');
const dechetRoute = require ('./routes/dechet.route.js');
const territoryRoute = require ('./routes/territory.route.js');


dotenv.config();
connectDB();

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  
  // Log de la requête entrante
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Intercepter la réponse
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      type: 'response',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    // Logger selon le statut
    if (res.statusCode >= 500) {
      logger.error(logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
});

// ✅ Middleware globaux
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// ✅ Routes principales
app.use('/api', authRoute);
app.use('/api', userRoute);
app.use('/api/agencies', agencyRoute);
app.use('/api/search/agencies', agencySearchRoute);
app.use('/api/agencies_validation', agencyValidationRoute);
app.use('/api/agency_employees', agencyEmployeeRoute); 
app.use('/api/pricing',pricingAgencyRoute); 
app.use('/api/wallet', walletRoute);
app.use('/api/subscription', subscriptionRoute);
app.use('/api/planning', planning);
app.use('/api/messages', messageRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/statistics', globalStateRoutes);
app.use('/api/collecte', qrValidationRoute);
app.use('/api/State_agencies', stateForAgencyRoute);
app.use('/api/collectes', collecteRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/dechets', dechetRoute);
app.use('/api/territories', territoryRoute);

// ✅ Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  logger.error({
    type: 'error',
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  
  // res.status(500).json({ error: 'Erreur serveur', details: err.message });
});

// ✅ Swagger (documentation)
swaggerDocs(app);

// ✅ Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ✅ Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur', details: err.message });
});


// Lancer le scheduler pour annuler automatiquement les abonnements expirés
scheduleSubscriptionCancellation();

// Lancer le scheduler pour la duplication automatique des plannings récurrents
initPlanningScheduler();

// ✅ Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`✅ Serveur lancé sur le port ${PORT}`);
});
