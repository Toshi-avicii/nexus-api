import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware";

const productRouter = Router();

productRouter.post("/", verifyToken, restrictToAdmin, createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", verifyToken, restrictToAdmin, updateProduct);
productRouter.delete("/:id", verifyToken, restrictToAdmin, deleteProduct);

export default productRouter;