import { Schema, model, Types, Document, Model } from "mongoose";

interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
}

interface IReviewModel extends Model<IReview> {}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxLength: 1000 },
    images: [{ type: String }],
  },
  { timestamps: true }
);

// Ensures a user can only review a product one time
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const ReviewModel: IReviewModel = model<IReview, IReviewModel>(
  "Review",
  reviewSchema
);
export default ReviewModel;
