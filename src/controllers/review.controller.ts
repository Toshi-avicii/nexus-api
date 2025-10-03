import { Request, Response, NextFunction } from "express";
import ReviewService from "../services/review.service";
import logger from "../utils/logger";
import { BadRequestError } from "../utils/errors";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const userId = res.locals.userId;
    const { rating, comment } = req.body;

    // Extract image URLs from req.files provided by Multer
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      imageUrls = (req.files as Express.Multer.File[]).map((file) => file.path);
    }

    if (!rating || !comment) {
      throw new BadRequestError("Rating and comment are required.");
    }

    const data = await ReviewService.createReview({
      productId,
      userId,
      rating,
      comment,
      images: imageUrls,
    });
    res.status(201).json(data);
  } catch (err) {
    logger.error("Error in createReview controller", { error: err });
    next(err);
  }
};

export const getReviewsForProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const data = await ReviewService.getReviewsForProduct(productId);
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error in getReviewsForProduct controller", { error: err });
    next(err);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    const userId = res.locals.userId;
    const updateBody = req.body;

    // If new images are uploaded, add their URLs to the update body
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      updateBody.images = (req.files as Express.Multer.File[]).map(
        (file) => file.path
      );
    }

    const data = await ReviewService.updateReview(reviewId, userId, updateBody);
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error in updateReview controller", { error: err });
    next(err);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    const userId = res.locals.userId;
    const userRole = res.locals.role;
    const data = await ReviewService.deleteReview(reviewId, userId, userRole);
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error in deleteReview controller", { error: err });
    next(err);
  }
};
