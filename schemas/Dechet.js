/**
* @swagger
* components:
*   schemas:
*     Dechet:
*       type: object
*       required:
*         - name
*       properties:
*         id:
*           type: string
*           description: ID du déchet
*         name:
*           type: string
*           description: name du déchet
*         description:
*           type: string
*           description: Description du déchet
*         color:
*           type: string
*           description: Couleur associée au déchet
*         binColor:
*           type: string
*           description: Couleur de la poubelle associée au déchet
*         frequency:
*           type: string
*           description: Fréquence de collecte du déchet
*         tips:
*           type: array
*           description: Conseils pour le tri ou la gestion du déchet
*           items:
*             type: string
*         instructions:
*           type: array
*           description: Instructions pour le tri ou la gestion du déchet
*           items:
*             type: string
*         acceptedItems:
*           type: array
*           description: Types de déchets acceptables
*           items:
*             type: string
*         rejectedItems:
*           type: array
*           description: Types de déchets rejettés
*           items:
*             type: string
*/