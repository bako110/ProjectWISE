const express = require('express');
const router = express.Router();
const AgencyValidationController = require('../controllers/superAdminValidateAgency');
const authMiddleware = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Agency Validation
 *   description: API de validation des agences (Super Admin seulement)
 */

/**
 * @swagger
 * /api/agencies_validation/{id}/validate:
 *   patch:
 *     summary: Valider une agence (Super Admin seulement)
 *     description: |
 *       Change le statut d'une agence de 'inactive' à 'active'
 *       ⚠️ Accès réservé aux Super Administrateurs uniquement
 *     tags: [Agency Validation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence à valider
 *     responses:
 *       200:
 *         description: Agence validée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé (réservé aux Super Admin)
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/validate', authMiddleware(), AgencyValidationController.validateAgency);

module.exports = router;

