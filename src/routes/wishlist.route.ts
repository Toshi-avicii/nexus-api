import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { addToWishlist, getWishlist, removeWishlistItem } from "../controllers/wishlist.controller";

const wishlistRouter = Router();

wishlistRouter.post("/", verifyToken, addToWishlist);
wishlistRouter.get("/", verifyToken, getWishlist);
wishlistRouter.delete("/:itemId", verifyToken, removeWishlistItem);

export default wishlistRouter;