import { Router } from "express";
import {
  createReview,
  getReviewsForProduct,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

const reviewRouter = Router();

reviewRouter.post(
  "/product/:productId",
  verifyToken,
  upload.array("images", 5),
  createReview
);

reviewRouter.get("/product/:productId", getReviewsForProduct);

reviewRouter.put(
  "/:reviewId",
  verifyToken,
  upload.array("images", 5),
  updateReview
);

reviewRouter.delete("/:reviewId", verifyToken, deleteReview);

export default reviewRouter;
