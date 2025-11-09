import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware";
import validateResource from "../middlewares/inputValidation.middleware";
import { productSchema } from "../validations/product.schema";

const productRouter = Router();

productRouter.post("/", verifyToken, restrictToAdmin, validateResource(productSchema), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", verifyToken, restrictToAdmin, validateResource(productSchema), updateProduct);
productRouter.delete("/:id", verifyToken, restrictToAdmin, deleteProduct);

export default productRouter;