import { z } from "zod";
import { VALID_STATES_AND_UTS } from "../utils/constants";
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export const newUserSchema = z.object({
    body: z.object({
        username: z.string().min(3, 'username is too short').max(20, 'username is too long'),
        email: z.email('email is not valid'),
        password: z.string().min(5, 'password is too short').max(15, 'password is too long').refine(
            (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(val),
            {
                message: 'Password must contain at least one digit, one lowercase, one uppercase letter and a special character',
            }
        ),
        role: z.enum(['admin', 'user'], "invalid role"),
        phone: z.string().min(10, 'phone no. is too short').max(10, 'phone no. too long'),
        isActive: z.boolean().optional(),
    })
})

export const loginUserSchema = z.object({
    body: z.object({
        email: z.email('email is not valid'),
        password: z.string().min(5, 'password is too short').max(15, 'password is too long').refine(
            (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(val),
            {
                message: 'Password must contain at least one digit, one lowercase, one uppercase letter and a special character',
            }
        ),
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.email('email is not valid')
    })
});

export const updateUserSchema = z.object({
    body: z.object({
        username: z.string().min(3, 'username is too short').max(20, 'username is too long'),
        email: z.email('email is not valid'),
        isActive: z.boolean().optional(),
    })
});

export const userAddressSchema = z.object({
    body: z.object({
        street: z.string().max(120, 'Street name is too long').min(3, 'Street name is too short'),
        city: z.string().max(50, 'City name is too long').min(2, 'City name is too short'),
        state: z.string().refine((val) => {
            const lowerCaseVal = val.toLowerCase();
            const validState = VALID_STATES_AND_UTS.find(state => state.toLowerCase() === lowerCaseVal);
            if (!validState) return false;
            else return true;
        }, {
            message: `value is not valid`
        }),
        country: z.string().refine((val) => val.toLowerCase() === "india", { message: "country is not valid" }),
        postalCode: z.string().max(6, 'postal code is too long')
    })
});

export const updateUserByAdminSchema = z.object({
    body: z.object({
        role: z.enum(['admin', 'user'], "invalid role"),
        isActive: z.boolean().optional(),
    })
});

// for validation middleware
export const newUserDocSchema = z.toJSONSchema(newUserSchema.shape.body, { target: 'openapi-3.0' });
export const loginUserDocSchema = z.toJSONSchema(loginUserSchema.shape.body, { target: 'openapi-3.0' });
export const forgotPasswordDocSchema = z.toJSONSchema(forgotPasswordSchema.shape.body, { target: "openapi-3.0" });
export const updateUserDocSchema = z.toJSONSchema(updateUserSchema.shape.body, { target: "openapi-3.0" });
export const userAddressDocSchema = z.toJSONSchema(userAddressSchema.shape.body, { target: 'openapi-3.0' });
export const updateUserByAdminDocSchema = z.toJSONSchema(updateUserByAdminSchema.shape.body, { target: 'openapi-3.0' });

// for Documentation
export const NewUserSchema = z.object({
    body: z.object({
        username: z.string().min(3, 'username is too short').max(20, 'username is too long'),
        email: z.email('email is not valid'),
        password: z.string().min(5, 'password is too short').max(15, 'password is too long').refine(
            (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(val),
            {
                message: 'Password must contain at least one digit, one lowercase, one uppercase letter and a special character',
            }
        ),
        role: z.enum(['admin', 'user'], "invalid role"),
        phone: z.string().min(10, 'phone no. is too short').max(10, 'phone no. too long'),
        isActive: z.boolean().optional(),
    })
}).openapi("NewUserBody");

export const LoginUserSchema = z.object({
    body: z.object({
        email: z.email('email is not valid'),
        password: z.string().min(5, 'password is too short').max(15, 'password is too long').refine(
            (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(val),
            {
                message: 'Password must contain at least one digit, one lowercase, one uppercase letter and a special character',
            }
        ),
    })
}).openapi("LoginUserBody");

export const ForgotPasswordSchema = z.object({
     body: z.object({
        email: z.email('email is not valid')
    })
}).openapi("ForgotPasswordBody");