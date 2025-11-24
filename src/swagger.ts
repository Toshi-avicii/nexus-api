import z from "zod";
import {
    extendZodWithOpenApi,
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import config from "./config";
import { AuthDocs } from "./docs/auth.docs";

// Extend Zod with OpenAPI decorators
extendZodWithOpenApi(z);

// Create registry for all openapi declarations
const registry = new OpenAPIRegistry();

AuthDocs.registerAuthDocs(registry);
AuthDocs.loginAuthDocs(registry);
AuthDocs.logoutAuthDocs(registry);
AuthDocs.getRefreshTokenAuthDocs(registry);
AuthDocs.forgotPasswordAuthDocs(registry);

registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "accessToken",
});

registry.registerComponent("securitySchemes", "refreshCookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "refreshToken",
});

// Create generator
const generator = new OpenApiGeneratorV3(registry.definitions);

// Final swagger document
const swaggerSpecification = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        title: "Nexus API",
        version: "1.0.0",
    },
    servers: [
        {
            url: `http://localhost:${config.port}/api/v1`,
            description: "Dev server",
        },
    ],
    security: [
        { cookieAuth: [] },
        { refreshCookieAuth: [] }
    ]
});

export default swaggerSpecification