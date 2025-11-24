import z from "zod";
import { applyCouponSchema, couponSchema, createCouponSchema, updateCouponSchema } from "../validations/coupon.schema";

export type CouponInput = z.infer<typeof couponSchema>;
export type AddCouponInput = z.infer<typeof createCouponSchema>['body'];
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>['body'];
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>['body'];