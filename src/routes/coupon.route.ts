import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controllers/coupon.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware"; // Assuming you create an isAdmin middleware
import validateResource from "../middlewares/inputValidation.middleware";
import { applyCouponSchema, createCouponSchema, updateCouponSchema } from "../validations/coupon.schema";

const couponRouter = Router();

couponRouter.post("/", verifyToken, restrictToAdmin, validateResource(createCouponSchema), createCoupon);
couponRouter.get("/", verifyToken, restrictToAdmin, getAllCoupons);
couponRouter.patch("/:id", verifyToken, restrictToAdmin, validateResource(updateCouponSchema), updateCoupon);
couponRouter.delete("/:id", verifyToken, restrictToAdmin, deleteCoupon);
couponRouter.post("/apply", verifyToken, validateResource(applyCouponSchema), applyCoupon);

export default couponRouter;
