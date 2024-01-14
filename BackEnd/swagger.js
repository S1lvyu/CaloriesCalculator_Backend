const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "http://localhost:3000/api/",
      version: "1.0.0",
      description: "Descrierea API-ului",
    },
  },
  apis: ["./routes/api/appRoutes.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
