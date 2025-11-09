import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { addToWishlist, getWishlist, removeWishlistItem } from "../controllers/wishlist.controller";
import validateResource from "../middlewares/inputValidation.middleware";
import { addToWishlistSchema } from "../validations/wishlist.schema";

const wishlistRouter = Router();

wishlistRouter.post("/", verifyToken, validateResource(addToWishlistSchema), addToWishlist);
wishlistRouter.get("/", verifyToken, getWishlist);
wishlistRouter.delete("/:itemId", verifyToken, removeWishlistItem);

export default wishlistRouter;