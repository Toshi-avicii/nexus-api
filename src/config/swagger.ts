import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nexus Ecommerce API",
      version: "1.0.0",
      description: "API documentation for Nexus Ecommerce API",
    },
    servers: [
      {
        url: "http://localhost:5050/api/v1",
        description: "Local Development server",
      },
      {
        url: 'http://localhost:5050/api/v1',
        description: 'Docker container server - if you are running this in a docker container'
      }
    ],
  },
  // Paths to files with documentation annotations
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/services/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
