/**
 * @swagger
 * components:
 *   schemas:
 *     Agence:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré par MongoDB
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         name:
 *           type: string
 *           description: Nom de l'agence
 *           example: Agence SAMA KEUR
 *         agencyDescription:
 *           type: string
 *           description: Description de l'agence
 *           example: Agence spécialisée dans la collecte des déchets ménagers
 *         zoneActivite:
 *           type: array
 *           description: Liste des zones d'activité de l'agence
 *           items:
 *             type: string
 *             example: Dakar
 *         client:
 *           type: string
 *           format: uuid
 *           description: ID d’un utilisateur client associé à l'agence
 *           example: 615c1b5fcf1c2a3b2f4e4f99
 *         collector:
 *           type: string
 *           format: uuid
 *           description: ID d’un utilisateur collecteur associé à l'agence
 *           example: 615c1b5fcf1c2a3b2f4e4faa
 *         slogan:
 *           type: string
 *           description: Slogan de l'agence
 *           example: Votre partenaire propreté !
 *         gestionnaires:
 *           type: array
 *           description: Liste des IDs des gestionnaires de l'agence
 *           items:
 *             type: string
 *             format: uuid
 *         owner:
 *           type: string
 *           format: uuid
 *           description: ID de l'utilisateur propriétaire de l'agence
 *         documents:
 *           type: array
 *           description: URLs ou chemins des documents associés à l'agence
 *           items:
 *             type: string
 *             example: https://example.com/documents/statut.pdf
 *         status:
 *           type: string
 *           description: Statut de l'agence
 *           enum: [active, inactive, deleted]
 *           default: active
 *           example: active
 *         location:
 *           type: object
 *           description: Coordonnées géographiques de l'agence (GeoJSON Point)
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               default: Point
 *               example: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-17.444, 14.692]
 *         deletedate:
 *           type: string
 *           format: date-time
 *           description: Date de suppression (soft delete)
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *           example: 2023-01-01T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *           example: 2023-01-02T14:30:00Z
 */
