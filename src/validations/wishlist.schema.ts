import z from "zod";

export const addToWishlistSchema = z.object({
    body: z.object({
        product: z.string({ error: "Product ID is required" }).regex(/^[a-f\d]{24}$/i, "Invalid product ObjectId"),
    })
});