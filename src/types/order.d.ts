import z from "zod";
import { createOrderBodySchema, orderSchema, updateOrderBodySchema } from "../validations/order.schema";

export type OrderInput = z.infer<typeof orderSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderBodySchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderBodySchema>['body'];