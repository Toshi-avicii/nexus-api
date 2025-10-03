import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import categoryRouter from "./category.route";
import productRouter from "./product.route";
import orderRouter from "./order.route";
import cartRouter from "./cart.route";
import wishlistRouter from "./wishlist.route";

const appRoutes = Router();

appRoutes.use('/auth', authRouter);
appRoutes.use('/users',userRouter);
appRoutes.use('/categories', categoryRouter)
appRoutes.use('/products', productRouter)
appRoutes.use('/orders',orderRouter);
appRoutes.use('/cart',cartRouter);
appRoutes.use('/wishlist',wishlistRouter);

export default appRoutes;