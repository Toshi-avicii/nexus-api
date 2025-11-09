import z from "zod";
import { addToWishlistSchema } from "../validations/wishlist.schema";

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>['body'];