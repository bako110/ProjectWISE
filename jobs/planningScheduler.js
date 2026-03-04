const cron = require('node-cron');
const { processPendingDuplications } = require('../services/planningDuplication.js');
const logger = require('../utils/logger.js');

/**
 * Initialise le scheduler pour la duplication automatique des plannings
 * 🔥 VERSION TEST : s'exécute chaque minute
 */
const initPlanningScheduler = () => {

    // 🔥 Exécution immédiate au démarrage (pour test)
    runManualDuplication();

    // 🔥 Cron chaque minute pour test
    cron.schedule('* * * * *', async () => {
        try {
            logger.info({
                msg: '🕐 CRON JOB: Démarrage duplication automatique plannings',
                time: new Date().toISOString()
            });

            const results = await processPendingDuplications();

            logger.info({
                msg: '✅ CRON JOB: Duplication plannings terminée',
                results: results,
                time: new Date().toISOString()
            });

        } catch (error) {
            logger.error({
                msg: '❌ CRON JOB: Erreur duplication plannings',
                error: error.message,
                stack: error.stack,
                time: new Date().toISOString()
            });
        }
    }, {
        scheduled: true,
        timezone: "Africa/Ouagadougou"
    });

    logger.info({
        msg: '✅ Scheduler de duplication plannings initialisé',
        schedule: 'Chaque minute (TEST - Africa/Ouagadougou)'
    });
};

/**
 * Exécute manuellement la duplication (pour tests)
 */
const runManualDuplication = async () => {
    try {
        logger.info({
            msg: '🔧 MANUEL: Démarrage duplication plannings',
            time: new Date().toISOString()
        });

        const results = await processPendingDuplications();

        logger.info({
            msg: '✅ MANUEL: Duplication plannings terminée',
            results: results,
            time: new Date().toISOString()
        });

        return results;

    } catch (error) {
        logger.error({
            msg: '❌ MANUEL: Erreur duplication plannings',
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

module.exports = {
    initPlanningScheduler,
    runManualDuplication
};


// const cron = require('node-cron');
// const { processPendingDuplications } = require('../services/planningDuplication.js');
// const logger = require('../utils/logger.js');

// /**
//  * Initialise le scheduler pour la duplication automatique des plannings
//  * S'exécute tous les jours à 00:30 (minuit et demi)
//  */
// const initPlanningScheduler = () => {
//     cron.schedule('30 0 * * *', async () => {
//         try {
//             logger.info({
//                 msg: '🕐 CRON JOB: Démarrage duplication automatique plannings',
//                 time: new Date().toISOString()
//             });

//             const results = await processPendingDuplications();

//             logger.info({
//                 msg: '✅ CRON JOB: Duplication plannings terminée',
//                 results: results,
//                 time: new Date().toISOString()
//             });

//         } catch (error) {
//             logger.error({
//                 msg: '❌ CRON JOB: Erreur duplication plannings',
//                 error: error.message,
//                 stack: error.stack,
//                 time: new Date().toISOString()
//             });
//         }
//     }, {
//         scheduled: true,
//         timezone: "Africa/Ouagadougou"
//     });

//     logger.info({
//         msg: '✅ Scheduler de duplication plannings initialisé',
//         schedule: 'Tous les jours à 00:30 (Africa/Ouagadougou)'
//     });
// };

// /**
//  * Exécute manuellement la duplication (pour tests)
//  */
// const runManualDuplication = async () => {
//     try {
//         logger.info({
//             msg: '🔧 MANUEL: Démarrage duplication plannings',
//             time: new Date().toISOString()
//         });

//         const results = await processPendingDuplications();

//         logger.info({
//             msg: '✅ MANUEL: Duplication plannings terminée',
//             results: results,
//             time: new Date().toISOString()
//         });

//         return results;

//     } catch (error) {
//         logger.error({
//             msg: '❌ MANUEL: Erreur duplication plannings',
//             error: error.message,
//             stack: error.stack
//         });
//         throw error;
//     }
// };

// module.exports = {
//     initPlanningScheduler,
//     runManualDuplication
// };
