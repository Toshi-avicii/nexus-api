import z from "zod";
import { addReviewSchema, updateReviewSchema } from "../validations/review.schema";

export type AddReviewInput = z.infer<typeof addReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];