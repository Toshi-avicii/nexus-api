import { z } from "zod";

/* ----------------------------------
   ITEM SCHEMA
---------------------------------- */
export const cartItemSchema = z.object({
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
});

/* ----------------------------------
   MAIN CART SCHEMA
---------------------------------- */
export const cartSchema = z.object({
    user: z
        .string({
            error: "User ID is required",
        })
        .regex(/^[a-f\d]{24}$/i, "Invalid user ObjectId"),

    items: z
        .array(cartItemSchema, {
            error: "Items are required",
        })
        .min(1, "Cart must contain at least one item"),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

/* -----------------------------
    ADD TO CART SCHEMA
-------------------------------- */

export const addToCartSchema = z.object({
    body: z.object({
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
    })
})

/* --------------------------------
    CHANGE ITEM QUANTITY
----------------------------------- */

export const updateCartItemQuantitySchema = z.object({
    body: z.object({
        quantity: z.number().nonnegative('Quantity cannot be negative')
    })
});