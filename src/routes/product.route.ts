import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware";
import { productSchema } from "../validations/product.schema";
import upload from "../middlewares/upload.middleware";
import validateProduct from "../middlewares/productValidation.middleware";

const productRouter = Router();

productRouter.use(verifyToken);

productRouter.post("/", restrictToAdmin, upload.array('images', 10), validateProduct(productSchema), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", restrictToAdmin, upload.array('images', 10), validateProduct(productSchema), updateProduct);
productRouter.delete("/:id", restrictToAdmin, deleteProduct);

export default productRouter;