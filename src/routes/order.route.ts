import { Router } from "express";
import { createOrder, getOrderById, getUserOrders } from "../controllers/order.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const orderRouter = Router();

orderRouter.post("/", verifyToken, createOrder);
orderRouter.get("/",verifyToken, getUserOrders);
orderRouter.get("/:id", verifyToken, getOrderById);

export default orderRouter;