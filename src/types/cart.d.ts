import z from "zod";
import { addToCartSchema, updateCartItemQuantitySchema } from "../validations/cart.schema";

export type CartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemQuantityInput = z.infer<typeof updateCartItemQuantitySchema>['body'];