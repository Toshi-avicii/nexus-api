import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller";
import { verifyToken, restrictToAdmin } from "../middlewares/auth.middleware";

const categoryRouter = Router();

categoryRouter.post("/", verifyToken, restrictToAdmin, createCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/:id", verifyToken, restrictToAdmin, updateCategory);
categoryRouter.delete("/:id", verifyToken, restrictToAdmin, deleteCategory);


export default categoryRouter;