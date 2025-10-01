import { Router } from "express";
import { addToCart, getCart, removeCartItem, updateCartItemQuantity } from "../controllers/cart.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.post("/", verifyToken, addToCart);
cartRouter.get("/", verifyToken, getCart);
cartRouter.put("/:itemId", verifyToken, updateCartItemQuantity);
cartRouter.delete("/:itemId", verifyToken, removeCartItem);

export default cartRouter;