import { Document, model, Model, models, Schema } from "mongoose";

interface Coupon extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount?: number;
  expirationDate?: Date;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

interface CouponModel extends Model<Coupon> {}

const couponSchema = new Schema<Coupon, CouponModel>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true, // Standardize codes to uppercase
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    minPurchaseAmount: {
      type: Number,
      min: [0, "Minimum purchase amount cannot be negative"],
    },
    expirationDate: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const couponModel: CouponModel =
  models.Coupon || model<Coupon, CouponModel>("Coupon", couponSchema);

export default couponModel;
