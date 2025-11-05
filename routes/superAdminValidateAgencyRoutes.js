const express = require('express');
const router = express.Router();
const AgencyValidationController = require('../controllers/superAdminValidateAgency');

/**
 * @swagger
 * tags:
 *   name: Agency Validation
 *   description: API de validation des agences
 */

/**
 * @swagger
 * /api/agencies_validation/{id}/validate:
 *   patch:
 *     summary: Valider une agence
 *     description: |
 *       Change le statut d'une agence de 'inactive' à 'active'
 *     tags: [Agency Validation]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
 *       400:
 *         description: ID manquant ou agence déjà active
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/validate', AgencyValidationController.validateAgency);

module.exports = router;