import { Router } from "express";
import { addToCart, getCart, removeCartItem, updateCartItemQuantity } from "../controllers/cart.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import validateResource from "../middlewares/inputValidation.middleware";
import { addToCartSchema, updateCartItemQuantitySchema } from "../validations/cart.schema";

const cartRouter = Router();

cartRouter.post("/", verifyToken, validateResource(addToCartSchema), addToCart);
cartRouter.get("/", verifyToken, getCart);
cartRouter.put("/:itemId", verifyToken, validateResource(updateCartItemQuantitySchema), updateCartItemQuantity);
cartRouter.delete("/:itemId", verifyToken, removeCartItem);

export default cartRouter;