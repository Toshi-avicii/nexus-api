import { z } from "zod";

/* ----------------------------------
   COUPON ZOD SCHEMA
---------------------------------- */
export const couponSchema = z.object({
    code: z
        .string({
            error: "Coupon code is required",
        })
        .min(1, "Coupon code is required")
        .transform((val) => val.trim().toUpperCase()), // mimic `trim` + `uppercase`

    discountType: z.enum(["percentage", "fixed"], {
        error: "Discount type is required",
    }),

    discountValue: z
        .number({
            error: "Discount value is required",
        })
        .min(0, "Discount value cannot be negative"),

    minPurchaseAmount: z
        .number({
            error: "Minimum purchase amount must be a number",
        })
        .min(0, "Minimum purchase amount cannot be negative")
        .optional(),

    expirationDate: z
        .union([z.string(), z.date()])
        .optional()
        .refine(
            (val) => !val || !isNaN(new Date(val).getTime()),
            "Invalid expiration date"
        )
        .transform((val) => (val ? new Date(val) : undefined)),

    usageLimit: z
        .number({
            error: "Usage limit must be a number",
        })
        .min(1, "Usage limit must be at least 1")
        .optional(),

    usageCount: z
        .number({
            error: "Usage count must be a number",
        })
        .nonnegative("Usage count cannot be negative")
        .default(0),

    isActive: z.boolean().default(true),
});

export const createCouponSchema = z.object({
    body: z.object({
        code: z
            .string({
                error: "Coupon code is required",
            })
            .min(1, "Coupon code is required")
            .transform((val) => val.trim().toUpperCase()), // mimic `trim` + `uppercase`

        discountType: z.enum(["percentage", "fixed"], {
            error: "Discount type is required",
        }),

        discountValue: z.number({ error: "Discount value is required" }).min(0, "Discount value cannot be negative"),

        minPurchaseAmount: z
            .number({
                error: "Minimum purchase amount must be a number",
            })
            .min(0, "Minimum purchase amount cannot be negative")
            .optional(),

        expirationDate: z
            .union([z.string(), z.date()])
            .optional()
            .refine(
                (val) => !val || !isNaN(new Date(val).getTime()),
                "Invalid expiration date"
            )
            .transform((val) => (val ? new Date(val) : undefined)),

        usageLimit: z
            .number({ error: "Usage limit must be a number" }).min(1, "Usage limit must be at least 1").optional(),
    })
});

type UpdateCouponBody = {
    code?: string | undefined;
    discountType?: "percentage" | "fixed" | undefined;
    discountValue?: number | undefined;
    minPurchaseAmount?: number | undefined;
    expirationDate?: Date | undefined;
    usageLimit?: number | undefined;
}

export const updateCouponSchema = z.object({
    body: z.object({
        code: z.string({ error: "Coupon code is required" }).min(1, "Coupon code is required").transform((val) => val.trim().toUpperCase()).optional(), // mimic `trim` + `uppercase`

        discountType: z.enum(["percentage", "fixed"], {
            error: "Discount type is required",
        }).optional(),

        discountValue: z.number({ error: "Discount value is required" }).min(0, "Discount value cannot be negative").optional(),

        minPurchaseAmount: z
            .number({
                error: "Minimum purchase amount must be a number",
            })
            .min(0, "Minimum purchase amount cannot be negative")
            .optional(),

        expirationDate: z
            .union([z.string(), z.date()])
            .optional()
            .refine(
                (val) => !val || !isNaN(new Date(val).getTime()),
                "Invalid expiration date"
            )
            .transform((val) => (val ? new Date(val) : undefined)),

        usageLimit: z
            .number({ error: "Usage limit must be a number" }).min(1, "Usage limit must be at least 1").optional(),
    })
});

export const applyCouponSchema = z.object({
    body: z.object({
        couponCode: z.string({ error: 'Coupon code is required' }).trim(),
        cartTotal: z.number({ error: 'Cart total is required' })
    })
})