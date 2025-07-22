import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { scanBarrel, getScanHistory, getScanDetails, getCollecteStatsByClient } from '../../controllers/agency/scanController.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Collectes
 *   description: Gestion des collectes via scan QR code sur barriques
 */

/**
 * @swagger
 * tags:
 *   name: Statistiques
 *   description: Statistiques des collectes par agence et client
 */

/**
 * @swagger
 * /api/scan/qr-code:
 *   post:
 *     summary: Valider un scan de barrique via QR code
 *     tags: [Collectes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - status
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: ID du client (barrique scannée)
 *                 example: "64fa7cf123abc456def78901"
 *               status:
 *                 type: string
 *                 enum: [collected, problem]
 *                 description: "Statut de la collecte : 'collected' pour collecte réussie, 'problem' pour problème rencontré"
 *                 example: "collected"
 *               comment:
 *                 type: string
 *                 description: "Commentaire décrivant le problème. Obligatoire si status est 'problem'"
 *                 example: "Le client n'était pas présent"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste d'URLs ou chemins des photos illustrant le problème (optionnel)
 *                 example: ["http://example.com/photo1.jpg", "http://example.com/photo2.jpg"]
 *               positionGPS:
 *                 type: object
 *                 description: Coordonnées GPS du lieu de collecte (optionnel)
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: float
 *                     minimum: -90
 *                     maximum: 90
 *                     description: Latitude
 *                     example: 12.345678
 *                   lng:
 *                     type: number
 *                     format: float
 *                     minimum: -180
 *                     maximum: 180
 *                     description: Longitude
 *                     example: -1.234567
 *     responses:
 *       201:
 *         description: Scan enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Collecte validée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     scanId:
 *                       type: string
 *                       description: ID du scan créé
 *                       example: "64fa7cf123abc456def78902"
 *                     clientId:
 *                       type: string
 *                       example: "64fa7cf123abc456def78901"
 *                     status:
 *                       type: string
 *                       example: "collected"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-22T10:30:00Z"
 *       400:
 *         description: "Données invalides"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "clientId est requis"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Le commentaire est obligatoire quand le statut est 'problem'"]
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token d'authentification invalide"
 *       403:
 *         description: Accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Rôle insuffisant pour cette action"
 *       404:
 *         description: Client introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Client avec l'ID fourni introuvable"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur serveur interne"
 */
router.post('/qr-code', authMiddleware('collector'), scanBarrel);

/**
 * @swagger
 * /api/scan/history:
 *   get:
 *     summary: Récupérer l'historique des scans du collecteur
 *     tags: [Collectes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page pour la pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Nombre d'éléments par page
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [collected, problem]
 *         description: Filtrer par statut de collecte
 *         example: "collected"
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filtrer par ID client
 *         example: "64fa7cf123abc456def78901"
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour filtrer (YYYY-MM-DD)
 *         example: "2025-07-01"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour filtrer (YYYY-MM-DD)
 *         example: "2025-07-31"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [timestamp, status, clientId]
 *           default: timestamp
 *         description: Champ de tri
 *         example: "timestamp"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Liste des scans avec pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     scans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64fa7cf123abc456def78902"
 *                           clientId:
 *                             type: string
 *                             example: "64fa7cf123abc456def78901"
 *                           clientName:
 *                             type: string
 *                             example: "Mr Ouattara"
 *                           status:
 *                             type: string
 *                             enum: [collected, problem]
 *                             example: "collected"
 *                           comment:
 *                             type: string
 *                             example: "Collecte effectuée sans problème"
 *                           photos:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: []
 *                           positionGPS:
 *                             type: object
 *                             properties:
 *                               lat:
 *                                 type: number
 *                                 example: 12.345678
 *                               lng:
 *                                 type: number
 *                                 example: -1.234567
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-07-22T10:30:00Z"
 *                           collectorId:
 *                             type: string
 *                             example: "64fa7cf123abc456def78903"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalScans:
 *                           type: integer
 *                           example: 89
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                         limit:
 *                           type: integer
 *                           example: 20
 *       400:
 *         description: Paramètres de requête invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Paramètres de pagination invalides"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token d'authentification requis"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération de l'historique"
 */
router.get('/history', authMiddleware('collector'), getScanHistory);

/**
 * @swagger
 * /api/scan/{scanId}:
 *   get:
 *     summary: Récupérer les détails d'un scan spécifique
 *     tags: [Collectes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scanId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du scan
 *         example: "64fa7cf123abc456def78902"
 *     responses:
 *       200:
 *         description: Détails du scan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     scan:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64fa7cf123abc456def78902"
 *                         clientId:
 *                           type: string
 *                           example: "64fa7cf123abc456def78901"
 *                         clientName:
 *                           type: string
 *                           example: "Mr Ouattara"
 *                         clientAddress:
 *                           type: string
 *                           example: "Secteur 12, Ouagadougou"
 *                         status:
 *                           type: string
 *                           enum: [collected, problem]
 *                           example: "collected"
 *                         comment:
 *                           type: string
 *                           example: "Collecte effectuée sans problème"
 *                         photos:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["http://example.com/photo1.jpg"]
 *                         positionGPS:
 *                           type: object
 *                           properties:
 *                             lat:
 *                               type: number
 *                               example: 12.345678
 *                             lng:
 *                               type: number
 *                               example: -1.234567
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-22T10:30:00Z"
 *                         collectorId:
 *                           type: string
 *                           example: "64fa7cf123abc456def78903"
 *                         collectorName:
 *                           type: string
 *                           example: "Jean Dupont"
 *                         agencyId:
 *                           type: string
 *                           example: "64fa7cf123abc456def78904"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-22T10:30:00Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-22T10:30:00Z"
 *       400:
 *         description: ID de scan invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Format d'ID invalide"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Accès non autorisé à ce scan"
 *       404:
 *         description: Scan introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Scan introuvable"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la récupération du scan"
 */
router.get('/:scanId', authMiddleware('collector'), getScanDetails);

/**
 * @swagger
 * /api/scan/stats/clients/{agencyId}:
 *   get:
 *     summary: Obtenir les statistiques de collectes par client pour une agence
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB de l'agence
 *         example: "64fa7cf123abc456def78904"
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour les statistiques (YYYY-MM-DD)
 *         example: "2025-07-01"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour les statistiques (YYYY-MM-DD)
 *         example: "2025-07-31"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [collected, problem, all]
 *           default: all
 *         description: Filtrer par statut de collecte
 *         example: "collected"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [clientName, nombreDeCollectes]
 *           default: nombreDeCollectes
 *         description: Champ de tri
 *         example: "nombreDeCollectes"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Statistiques des collectes par client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     clients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           clientId:
 *                             type: string
 *                             description: ID du client
 *                             example: "64fa832e9f6d874d3b27c1dd"
 *                           clientName:
 *                             type: string
 *                             description: Nom du client
 *                             example: "Mr Ouattara"
 *                           clientAddress:
 *                             type: string
 *                             description: Adresse du client
 *                             example: "Secteur 12, Ouagadougou"
 *                           nombreDeCollectes:
 *                             type: integer
 *                             description: Nombre total de collectes
 *                             example: 8
 *                           collectesReussies:
 *                             type: integer
 *                             description: Nombre de collectes réussies
 *                             example: 7
 *                           collectesProblemes:
 *                             type: integer
 *                             description: Nombre de collectes avec problème
 *                             example: 1
 *                           derniereCollecte:
 *                             type: string
 *                             format: date-time
 *                             description: Date de la dernière collecte
 *                             example: "2025-07-22T10:30:00Z"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalClients:
 *                           type: integer
 *                           example: 156
 *                         totalCollectes:
 *                           type: integer
 *                           example: 1248
 *                         collectesReussies:
 *                           type: integer
 *                           example: 1180
 *                         collectesProblemes:
 *                           type: integer
 *                           example: 68
 *                         tauxReussite:
 *                           type: number
 *                           format: float
 *                           example: 94.55
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "ID d'agence invalide"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token d'authentification requis"
 *       403:
 *         description: Accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Accès non autorisé à cette agence"
 *       404:
 *         description: Agence introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Agence introuvable"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de la génération des statistiques"
 */
router.get('/stats/clients/:agencyId', authMiddleware(['agency', 'manager', 'collector']), getCollecteStatsByClient);

export default router;