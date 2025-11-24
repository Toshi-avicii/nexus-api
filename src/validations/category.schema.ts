import z from "zod";

export const categorySchema = z.object({
    body: z.object({
        name: z.string().min(2, 'category name is too short').max(50, 'category name is too long'),
        description: z.string().min(2, 'description is too short').max(500, 'description is too long')
    })
});