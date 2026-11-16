
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "EventHub API",
      version: "1.0.0",
      description:
        "Documentación de la API REST de EventHub. Módulo de autenticación, usuarios y seguridad."
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken"
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
