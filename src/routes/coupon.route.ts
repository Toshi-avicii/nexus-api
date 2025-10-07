import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controllers/coupon.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware"; // Assuming you create an isAdmin middleware

const couponRouter = Router();

couponRouter.post("/", verifyToken, restrictToAdmin, createCoupon);
couponRouter.get("/", verifyToken, restrictToAdmin, getAllCoupons);
couponRouter.patch("/:id", verifyToken, restrictToAdmin, updateCoupon);
couponRouter.delete("/:id", verifyToken, restrictToAdmin, deleteCoupon);
couponRouter.post("/apply", verifyToken, applyCoupon);

export default couponRouter;
