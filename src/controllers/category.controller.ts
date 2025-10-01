import { NextFunction, Request, Response } from "express";
import CategoryService from "../services/category.service";
import logger from "../utils/logger";

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const data = await CategoryService.createCategory({ name, description });
    logger.info("Category created successfully", { name });
    res.status(201).json(data);
  } catch (err) {
    logger.error("Error occurred in createCategory", { error: err });
    next(err);
  }
};


export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CategoryService.getAllCategories();
    logger.info("Categories retrieved successfully");
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getAllCategories", { error: err });
    next(err);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await CategoryService.getCategoryById(id);
    logger.info("Category retrieved successfully", { id });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getCategoryById", { error: err });
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const data = await CategoryService.updateCategory(id, { name, description });
    logger.info("Category updated successfully", { id, name: data.data.name });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in updateCategory", { error: err });
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);
    if(result) {
      logger.info("Category deleted successfully", { id });
      res.status(200).json({
        message: "category deleted successfully",
        id
      });
    } else {
      throw new Error("Could not delete category");
    }
  } catch (err) {
    logger.error("Error occurred in deleteCategory", { error: err });
    next(err);
  }
};