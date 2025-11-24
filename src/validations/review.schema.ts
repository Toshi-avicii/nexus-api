import z from "zod";

export const addReviewSchema = z.object({
    body: z.object({
        rating: z.number().nonnegative('Rating is invalid').min(0, 'Rating is invalid'),
        comment: z.string().min(1, 'comment is too short').max(2000, 'comment is too long')
    })
});

export const updateReviewSchema = z.object({
    body: z.object({
        rating: z.number().nonnegative('Rating is invalid').min(0, 'Rating is invalid').optional(),
        comment: z.string().min(1, 'comment is too short').max(2000, 'comment is too long').optional(),
        images: z.array(z.string()).optional()
    })
})