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

const orderRouter = Router();

orderRouter.post("/", verifyToken, createOrder);
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
  updateOrderStatus
);

export default orderRouter;
