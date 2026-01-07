import { Router } from "express";
import { bulkUploadProducts, createProduct, getAllDeletedProducts, getAllProducts, getProductById, hardDeleteManyProducts, hardDeleteProduct, moveProductFromBin, softDeleteManyProducts, softDeleteProduct, updateProduct } from "../controllers/product.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware";
import { productSchema } from "../validations/product.schema";
import upload, { excelSheetUpload } from "../middlewares/upload.middleware";
import validateProduct from "../middlewares/productValidation.middleware";
import { compressProductImages } from "../middlewares/compressImage.middleware";

const productRouter = Router();

productRouter.use(verifyToken);
productRouter.delete("/move/bin", restrictToAdmin, softDeleteManyProducts);
productRouter.delete('/move/delete', restrictToAdmin, hardDeleteManyProducts);
productRouter.post('/bulk-upload', restrictToAdmin, excelSheetUpload.single('file'), bulkUploadProducts);
productRouter.get('/bin', restrictToAdmin, getAllDeletedProducts);
productRouter.delete('/bin/:id', restrictToAdmin, hardDeleteProduct);
productRouter.put('/bin/:id', restrictToAdmin, moveProductFromBin);

productRouter.post("/", restrictToAdmin, upload.array('images', 10), compressProductImages, validateProduct(productSchema), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", restrictToAdmin, upload.array('images', 10), compressProductImages, validateProduct(productSchema), updateProduct);
productRouter.delete("/:id", restrictToAdmin, softDeleteProduct);
export default productRouter;