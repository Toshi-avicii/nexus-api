import ReviewModel from "../models/review.model";
import orderModel from "../models/order.model";
import {
  BadRequestError,
  NotFoundError,
  AuthenticationError,
} from "../utils/errors";

interface CreateReviewParams {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  images?: string[];
}

interface UpdateReviewBody {
  rating?: number | undefined;
  comment?: string | undefined;
  images?: string[] | undefined;
}

export default class ReviewService {
  static async createReview({
    productId,
    userId,
    rating,
    comment,
    images,
  }: CreateReviewParams) {
    // Business Logic: Verify the user has purchased this product
    const hasPurchased = await orderModel.findOne({
      user: userId,
      status: "delivered", // Must be a completed order
      "items.product": productId,
    });

    if (!hasPurchased) {
      throw new BadRequestError(
        "You can only review products you have purchased."
      );
    }

    // Check if the user has already reviewed this product
    const existingReview = await ReviewModel.findOne({
      product: productId,
      user: userId,
    });
    if (existingReview) {
      throw new BadRequestError("You have already reviewed this product.");
    }

    const newReview = await ReviewModel.create({
      product: productId,
      user: userId,
      rating,
      comment,
      images,
    });
    return { message: "Review added successfully.", data: newReview };
  }

  static async getReviewsForProduct(productId: string) {
    const reviews = await ReviewModel.find({ product: productId })
      .populate("user", "username avatarUrl") // Show reviewer's name and avatar
      .sort({ createdAt: -1 });
    return { data: reviews };
  }

  static async updateReview(
    reviewId: string,
    userId: string,
    updateBody: UpdateReviewBody
  ) {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Review not found.");
    }

    // Ensure only the owner can update their review
    if (review.user.toString() !== userId) {
      throw new AuthenticationError(
        "You are not authorized to update this review."
      );
    }

    // Update fields if they are provided
    if (updateBody.rating) review.rating = updateBody.rating;
    if (updateBody.comment) review.comment = updateBody.comment;
    if (updateBody.images) review.images = updateBody.images; // Replace old images with new ones

    await review.save();
    return { message: "Review updated successfully.", data: review };
  }

  static async deleteReview(
    reviewId: string,
    userId: string,
    userRole: string
  ) {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Review not found.");
    }

    // Ensure only the owner or an admin can delete the review
    if (review.user.toString() !== userId && userRole !== "admin") {
      throw new AuthenticationError(
        "You are not authorized to delete this review."
      );
    }

    await ReviewModel.findByIdAndDelete(reviewId);
    return { message: "Review deleted successfully." };
  }
}
