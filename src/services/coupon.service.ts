import couponModel from "../models/coupon.model";
import { BadRequestError, NotFoundError } from "../utils/errors";

interface CreateCouponBody {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount?: number;
  expirationDate?: Date;
  usageLimit?: number;
}

type UpdateCouponBody = Partial<CreateCouponBody>;

export default class CouponService {
  static async createCoupon(body: CreateCouponBody) {
    const {
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      expirationDate,
      usageLimit,
    } = body;

    const existingCoupon = await couponModel.findOne({ code });
    if (existingCoupon) {
      throw new BadRequestError("A coupon with this code already exists.");
    }

    if (
      discountType === "percentage" &&
      (discountValue <= 0 || discountValue > 100)
    ) {
      throw new BadRequestError(
        "Percentage discount must be between 1 and 100."
      );
    }

    const newCoupon = await couponModel.create({
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      expirationDate,
      usageLimit,
    });

    return {
      message: "Coupon created successfully.",
      data: newCoupon,
    };
  }

  static async getAllCoupons() {
    const coupons = await couponModel.find().sort({ createdAt: -1 });
    return {
      message: "Coupons retrieved successfully.",
      data: coupons,
    };
  }

  static async updateCoupon(couponId: string, body: UpdateCouponBody) {
    const updatedCoupon = await couponModel.findByIdAndUpdate(couponId, body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    if (!updatedCoupon) {
      throw new NotFoundError("Coupon not found.");
    }

    return {
      message: "Coupon updated successfully.",
      data: updatedCoupon,
    };
  }

  static async deleteCoupon(couponId: string) {
    const deletedCoupon = await couponModel.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      throw new NotFoundError("Coupon not found.");
    }

    return {
      message: "Coupon deleted successfully.",
    };
  }

  static async applyCoupon(couponCode: string, cartTotal: number) {
    const coupon = await couponModel.findOne({
      code: couponCode,
      isActive: true,
    });

    // --- Validation Checks ---
    if (!coupon) {
      throw new BadRequestError("Invalid coupon code.");
    }
    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      throw new BadRequestError("This coupon has expired.");
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestError("This coupon has reached its usage limit.");
    }
    if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
      throw new BadRequestError(
        `You must spend at least $${coupon.minPurchaseAmount} to use this coupon.`
      );
    }

    // --- Calculate Discount ---
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
      // 'fixed'
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed the cart total
    discountAmount = Math.min(discountAmount, cartTotal);
    const finalTotal = cartTotal - discountAmount;

    return {
      message: "Coupon applied successfully!",
      data: {
        originalTotal: cartTotal,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalTotal: parseFloat(finalTotal.toFixed(2)),
      },
    };
  }
}
