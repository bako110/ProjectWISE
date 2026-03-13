const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API WasteWise',
      version: '1.0.0',
      description: 'Documentation de toutes les routes du backend',
    },
    servers: [
      { url: 'http://localhost:3000' },
      { url: 'http://213.32.120.11:3000' },
      { url: 'https://projectwise-1.onrender.com/' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/**/*.js', './schemas/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  // UI Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Endpoint JSON brut
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
