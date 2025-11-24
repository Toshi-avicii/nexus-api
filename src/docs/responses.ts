import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

const registry = new OpenAPIRegistry();

const addressSchema = z.object({
    street: z.string().max(120, "street name should be no longer than 120 characters"),
    city: z.string().max(50, "city name should be no longer than 50 characters"),
    state: z.string().max(35, "state name should be no longer than 35 characters"),
    country: z.string().max(120, "country name should be no longer than 120 characters"),
    postalCode: z.string().max(6, "postal code should be no longer than 6 characters")
})

export const createUserDocResponse = registry.register(
  "CreateUserResponse",
  z.object({
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR..." }),
    refreshToken: z.string().openapi({ example: "fgd7834bdf834bf7834..." }),
    data: z.object({
      user: z.object({
        _id: z.string().openapi({ example: "6921b70428527d435b0fab0f..." }),
        username: z.string().openapi({ example: "John Doe" }),
        email: z.string().openapi({ example: "johndoe@gmail.com" }),
        role: z.string().openapi({ example: "user" }),
        phone: z.string().openapi({ example: "0011223344" })
      })
    })
  })
);

export const loginUserDocResponse = registry.register(
  "LoginUserResponse",
  z.object({
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR..." }),
    refreshToken: z.string().openapi({ example: "fgd7834bdf834bf7834..." }),
    data: z.object({
      user: z.object({
        _id: z.string().openapi({ example: "6921b70428527d435b0fab0f..." }),
        username: z.string().openapi({ example: "John Doe" }),
        email: z.string().openapi({ example: "johndoe@gmail.com" }),
        role: z.string().openapi({ example: "user" }),
        phone: z.string().openapi({ example: "0011223344" }),
        address: z.array(addressSchema).nullish().openapi({ example: "[] | [AddressObj]" })
      })
    })
  })
);

export const getRefreshTokenDocResponse = registry.register(
    "GetRefreshTokenDocResponse",
    z.object({
        success: z.boolean().openapi({ example: true }),
        message: z.string().openapi({ example: "Tokens refreshed successfully" })
    })
);

export const tokenNotPresentDocResponse = registry.register(
    "TokenNotPresentDocResponse",
    z.object({
        success: z.boolean().openapi({ example: false }),
        message: z.string().openapi({ example: "Token not present" })
    })
);

export const tokenDoesNotExistDocResponse = registry.register(
    "TokenDoesNotExistDocResponse",
    z.object({
        success: z.boolean().openapi({ example: false }),
        message: z.string().openapi({ example: "Invalid Token" })
    })
);

export const forgotPasswordDocResponse = registry.register(
  "ForgotPasswordDocResponse",
  z.object({
    message: z.string().openapi({ example: "Password reset link sent to email." })
  })
)