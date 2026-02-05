/**
 * @swagger
 * components:
 *   schemas:
 *     City:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID de la ville
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         name:
 *           type: string
 *           description: Nom de la ville
 *           example: Dakar
 *         isArrondissement:
 *           type: boolean
 *           description: Indique si la ville est un arrondissement
 *           example: false
 *         latitude:
 *           type: number
 *           description: Latitude de la ville
 *           example: 14.692
 *         longitude:
 *           type: number
 *           description: Longitude de la ville
 *           example: -17.444
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de la ville
 *           example: 2023-01-01T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de la ville
 *           example: 2023-01-02T14:30:00Z
 *
 *     Arrondissement:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID de l'arrondissement
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         name:
 *           type: string
 *           description: Nom de l'arrondissement
 *           example: Dakar-Plateau
 *         cityId:
 *           type: string
 *           description: ID de la ville à laquelle l'arrondissement appartient
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         latitude:
 *           type: number
 *           description: Latitude de l'arrondissement
 *           example: 14.692
 *         longitude:
 *           type: number
 *           description: Longitude de l'arrondissement
 *           example: -17.444
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'arrondissement
 *           example: 2023-01-01T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'arrondissement
 *           example: 2023-01-02T14:30:00Z
 *
 *     Sector:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID du secteur
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         name:
 *           type: string
 *           description: Nom du secteur
 *           example: Dakar-Plateau
 *         arrondissementId:
 *           type: string
 *           description: ID de l'arrondissement auquel le secteur appartient
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         cityId:
 *           type: string
 *           description: ID de la ville à laquelle le secteur appartient
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         latitude:
 *           type: number
 *           description: Latitude du secteur
 *           example: 14.692
 *         longitude:
 *           type: number
 *           description: Longitude du secteur
 *           example: -17.444
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du secteur
 *           example: 2023-01-01T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du secteur
 *           example: 2023-01-02T14:30:00Z
 *
 *     Neighborhood:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID du quartier
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         name:
 *           type: string
 *           description: Nom du quartier
 *           example: Dakar-Plateau
 *         sectorId:
 *           type: string
 *           description: ID du secteur auquel le quartier appartient
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         arrondissementId:
 *           type: string
 *           description: ID de l'arrondissement auquel le quartier appartient
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         cityId:
 *           type: string
 *           description: ID de la ville à laquelle le quartier appartient
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         latitude:
 *           type: number
 *           description: Latitude du quartier
 *           example: 14.692
 *         longitude:
 *           type: number
 *           description: Longitude du quartier
 *           example: -17.444
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du quartier
 *           example: 2023-01-01T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du quartier
 *           example: 2023-01-02T14:30:00Z
 */
