import { z } from "zod";
import { ORDER_STATUSES } from "../utils/constants";

/* ----------------------------------
   ITEM SCHEMA
---------------------------------- */
export const orderItemSchema = z.object({
    product: z
        .string({
            error: "Product ID is required",
        })
        .regex(/^[a-f\d]{24}$/i, "Invalid product ObjectId"),
    quantity: z
        .number({
            error: "Quantity is required",
        })
        .min(1, "Quantity must be at least 1"),
    price: z
        .number({
            error: "Price is required",
        })
        .min(0, "Price cannot be negative"),
});

/* ----------------------------------
   SHIPPING ADDRESS SCHEMA
---------------------------------- */
export const shippingAddressSchema = z.object({
    street: z.string().max(100, "Street must not exceed 100 characters").optional(),
    city: z.string().max(50, "City must not exceed 50 characters").optional(),
    state: z.string().max(50, "State must not exceed 50 characters").optional(),
    country: z.string().max(50, "Country must not exceed 50 characters").optional(),
    postalCode: z.string().max(20, "Postal code must not exceed 20 characters").optional(),
});

/* ----------------------------------
   MAIN ORDER SCHEMA
---------------------------------- */
export const orderSchema = z.object({
    body: z.object({
        user: z
            .string({
                error: "User ID is required",
            })
            .regex(/^[a-f\d]{24}$/i, "Invalid user ObjectId"),

        items: z
            .array(orderItemSchema, {
                error: "At least one order item is required",
            })
            .min(1, "Order must contain at least one item"),

        totalAmount: z
            .number({
                error: "Total amount is required",
            })
            .min(0, "Total amount cannot be negative"),

        status: z
            .enum(ORDER_STATUSES)
            .default("pending"),

        shippingAddress: shippingAddressSchema.optional(),

        payment: z
            .string()
            .regex(/^[a-f\d]{24}$/i, "Invalid payment ObjectId")
            .optional(),

        returnReason: z
            .string()
            .max(500, "Return reason must not exceed 500 characters")
            .optional(),

        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
    })
});

/* ---------------------------------
    CREATE ORDER SCHEMA
---------------------------------- */ 

export const createOrderBodySchema = z.object({
    body: z.object({
        user: z
            .string({
                error: "User ID is required",
            })
            .regex(/^[a-f\d]{24}$/i, "Invalid user ObjectId"),

        items: z
            .array(orderItemSchema, {
                error: "At least one order item is required",
            })
            .min(1, "Order must contain at least one item"),

        shippingAddress: shippingAddressSchema.optional(),
        payment: z
            .string()
            .regex(/^[a-f\d]{24}$/i, "Invalid payment ObjectId")
            .optional(),
    })
});

export const updateOrderBodySchema = z.object({
    body: z.object({
        status: z.enum(ORDER_STATUSES, 'Invalid order status')
    })
})