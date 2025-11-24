import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ForgotPasswordSchema, LoginUserSchema, NewUserSchema } from "../validations/user.schema";
import { createUserDocResponse, forgotPasswordDocResponse, getRefreshTokenDocResponse, loginUserDocResponse } from "./responses";
import { SchemaObject } from "zod-openapi/dist/components-JnL0iOr_.cjs";

const error401 = {
    description: "Error occurred",
    content: {
        'application/json': {
            schema: {
                type: "object",
                properties: {
                    error: {
                        type: "object",
                        properties: {
                            message: { type: "string", example: "Invalid Credentials" },
                            type: { type: "string", example: "AuthenticationError" }
                        }
                    }
                }
            } satisfies SchemaObject
        }
    }
}

export class AuthDocs {
    static registerAuthDocs(registry: OpenAPIRegistry) {
        registry.register("CreateUserResponse", createUserDocResponse);
        registry.registerPath({
            method: "post",
            path: "/auth/register",
            tags: ["Auth"],
            summary: "Register a new user",
            request: {
                body: {
                    content: {
                        "application/json": { schema: NewUserSchema.shape.body },
                    },
                },
            },
            responses: {
                201: {
                    description: "User registered successfully",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CreateUserResponse" },
                        },
                    },
                    headers: {
                        "Set-Cookie": {
                            description: "Two HttpOnly cookies sent: accessToken & refreshToken",
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                                example: [
                                    "accessToken=eyJhbGciOiJIUzI1Ni...; HttpOnly; Path=/; Max-Age=900; SameSite=Strict",
                                    "refreshToken=eyJh...; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict",
                                ]
                            }
                        }
                    }
                },
                401: {
                    description: "Error occurred",
                },
            },
        });
    }

    static loginAuthDocs(registry: OpenAPIRegistry) {
        registry.register("LoginUserResponse", loginUserDocResponse)
        registry.registerPath({
            method: "post",
            path: "/auth/login",
            tags: ["Auth"],
            summary: "Login user",
            request: {
                body: {
                    content: {
                        "application/json": { schema: LoginUserSchema.shape.body },
                    },
                },
            },
            responses: {
                200: {
                    description: "User login successfully",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LoginUserResponse" },
                        },
                    },
                    headers: {
                        "Set-Cookie": {
                            description: "Two HttpOnly cookies sent: accessToken & refreshToken",
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                                example: [
                                    "accessToken=eyJhbGciOiJIUzI1Ni...; HttpOnly; Path=/; Max-Age=900; SameSite=Strict",
                                    "refreshToken=eyJh...; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict",
                                ]
                            }
                        }
                    }
                },
                401: error401,
                400: {
                    description: "Invalid credentials",
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                message: { type: "string" },
                                                path: { type: "string" }
                                            },
                                            required: ["message", "path"],
                                        },
                                        example: [
                                            {
                                                message:
                                                    "Password must contain at least one digit, one lowercase, one uppercase letter and a special character",
                                                path: "body.password"
                                            },
                                            {
                                                message: "Email is required",
                                                path: "body.email"
                                            }
                                        ],
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });
    }

    static logoutAuthDocs(registry: OpenAPIRegistry) {
        registry.register("LoginUserResponse", loginUserDocResponse)
        registry.registerPath({
            method: "post",
            path: "/auth/logout",
            tags: ["Auth"],
            summary: "Logout the user",
            responses: {
                200: {
                    description: "Logged out successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Logged out successfully" },
                                }
                            },
                        },
                    },
                },
                401: error401,
                400: {
                    description: "Invalid Token",
                }
            },
        });
    }

    static getRefreshTokenAuthDocs(registry: OpenAPIRegistry) {
        registry.register("GetRefreshTokenDocResponse", getRefreshTokenDocResponse);
        registry.registerPath({
            method: "post",
            path: "/auth/refresh",
            tags: ["Auth"],
            summary: "get the refresh token based on access token",
            security: [
                { refreshToken: [] }
            ],

            responses: {
                200: {
                    description: "Tokens refreshed successfully",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/GetRefreshTokenDocResponse" },
                        },
                    },
                    headers: {
                        "Set-Cookie": {
                            description: "Two HttpOnly cookies sent: accessToken & refreshToken",
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                                example: [
                                    "accessToken=eyJhbGciOiJIUzI1Ni...; HttpOnly; Path=/; Max-Age=900; SameSite=Strict",
                                    "refreshToken=eyJh...; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict",
                                ]
                            }
                        }
                    }
                },
                401: error401,
                400: {
                    description: "Invalid Token",
                }
            },
        });
    }

    static forgotPasswordAuthDocs(registry: OpenAPIRegistry) {
        registry.register("ForgotPasswordDocResponse", forgotPasswordDocResponse);
        registry.registerPath({
            method: "post",
            path: "/auth/forgot-password",
            tags: ["Auth"],
            summary: "get the reset password mail to user's mail id",
            request: {
                body: {
                    content: {
                        "application/json": { schema: ForgotPasswordSchema.shape.body },
                    },
                },
            },
            responses: {
                200: {
                    description: "Password reset link sent to email.",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ForgotPasswordDocResponse" },
                        },
                    },
                },
                401: error401,
                400: {
                    description: "Bad Request",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error: { type: "object", properties: {
                                        message: { type: "string", example: "Invalid credentials" },
                                        type: { type: "string", example: "AuthenticationError" }
                                    } }
                                }
                            }
                        }
                    }
                }
            },
        });
    }
}
