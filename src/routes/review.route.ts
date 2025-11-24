import { Router } from "express";
import {
  createReview,
  getReviewsForProduct,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";
import validateResource from "../middlewares/inputValidation.middleware";
import { addReviewSchema, updateReviewSchema } from "../validations/review.schema";

const reviewRouter = Router();

reviewRouter.post(
  "/product/:productId",
  verifyToken,
  upload.array("images", 5),
  validateResource(addReviewSchema),
  createReview
);

reviewRouter.get("/product/:productId", getReviewsForProduct);

reviewRouter.put(
  "/:reviewId",
  verifyToken,
  upload.array("images", 5),
  validateResource(updateReviewSchema),
  updateReview
);

reviewRouter.delete("/:reviewId", verifyToken, deleteReview);

export default reviewRouter;
