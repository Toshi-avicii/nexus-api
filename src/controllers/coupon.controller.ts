import { NextFunction, Request, Response } from "express";
import CouponService from "../services/coupon.service";
import logger from "../utils/logger";
import { AuthenticationError, BadRequestError } from "../utils/errors";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await CouponService.createCoupon(req.body);
    logger.info("Coupon created successfully", { code: req.body.code });
    res.status(201).json(data);
  } catch (err) {
    logger.error("Error occurred in createCoupon", { error: err });
    next(err);
  }
};

export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await CouponService.getAllCoupons();
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getAllCoupons", { error: err });
    next(err);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const data = await CouponService.updateCoupon(id, req.body);
    logger.info("Coupon updated successfully", { couponId: id });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in updateCoupon", { error: err });
    next(err);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await CouponService.deleteCoupon(id);
    logger.info("Coupon deleted successfully", { couponId: id });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in deleteCoupon", { error: err });
    next(err);
  }
};

export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cartTotal } = req.body;

    if (!couponCode || typeof cartTotal !== "number") {
      throw new BadRequestError(
        "Both 'couponCode' and 'cartTotal' are required."
      );
    }

    const data = await CouponService.applyCoupon(couponCode, cartTotal);
    logger.info("Coupon applied successfully", {
      code: couponCode,
      userId: res.locals.userId,
    });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in applyCoupon", { error: err });
    next(err);
  }
};
