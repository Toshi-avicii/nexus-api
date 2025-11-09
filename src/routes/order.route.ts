import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  getAllOrdersForAdmin,
  getOrderById,
  getUserOrders,
  requestReturn,
  updateOrderStatus,
} from "../controllers/order.controller";
import { restrictToAdmin, verifyToken } from "../middlewares/auth.middleware";
import validateResource from "../middlewares/inputValidation.middleware";
import { createOrderBodySchema, updateOrderBodySchema } from "../validations/order.schema";

const orderRouter = Router();

orderRouter.post("/", verifyToken, validateResource(createOrderBodySchema), createOrder);
orderRouter.get("/", verifyToken, getUserOrders);
orderRouter.get("/:id", verifyToken, getOrderById);
orderRouter.patch("/:id/cancel", verifyToken, cancelOrder);
orderRouter.patch("/:id/return", verifyToken, requestReturn);
orderRouter.get(
  "/admin/all",
  verifyToken,
  restrictToAdmin,
  getAllOrdersForAdmin
);
orderRouter.put(
  "/:orderId/status",
  verifyToken,
  restrictToAdmin,
  validateResource(updateOrderBodySchema),
  updateOrderStatus
);

export default orderRouter;
