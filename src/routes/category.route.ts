import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware";
import validateResource from "../middlewares/inputValidation.middleware";
import { categorySchema } from "../validations/category.schema";

const categoryRouter = Router();

categoryRouter.post("/", verifyToken, restrictToAdmin, validateResource(categorySchema),createCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/:id", verifyToken, restrictToAdmin, validateResource(categorySchema), updateCategory);
categoryRouter.delete("/:id", verifyToken, restrictToAdmin, deleteCategory);


export default categoryRouter;