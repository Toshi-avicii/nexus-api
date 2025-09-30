import { MongooseError } from "mongoose";
import categoryModel from "../models/category.model";
import { ValidationError, BadRequestError } from "../utils/errors";
import logger from "../utils/logger";

interface CreateCategoryBody {
  name: string;
  description?: string;
}

interface UpdateCategoryBody {
  name?: string;
  description?: string;
}

export default class CategoryService {
  static async createCategory(body: CreateCategoryBody) {
    try {
      // Validate input
      if (!body.name) {
        logger.warn("Category name is required");
        throw new ValidationError("Category name is required");
      }

      // Check if category already exists
      const existingCategory = await categoryModel.findOne({
        name: body.name.trim(),
      });
      if (existingCategory) {
        logger.warn("Category already exists", { name: body.name });
        throw new BadRequestError("Category with this name already exists");
      }

      // Create new category
      logger.info("Creating new category", { name: body.name });
      const newCategory = await categoryModel.create({
        name: body.name.trim(),
        description: body.description?.trim(),
      });

      logger.info("Category created successfully", {
        name: newCategory.name,
        _id: newCategory._id,
      });
      return {
        data: {
          _id: newCategory._id,
          name: newCategory.name,
          description: newCategory.description,
          createdAt: newCategory.createdAt,
          updatedAt: newCategory.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in createCategory", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async getAllCategories() {
    try {
      logger.info("Fetching all categories");
      const categories = await categoryModel.find({}).lean();
      logger.info("Categories retrieved successfully", {
        count: categories.length,
      });
      return {
        data: categories.map((category) => ({
          _id: category._id,
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
      };
    } catch (err) {
      logger.error("Error in getAllCategories", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async getCategoryById(id: string) {
    try {
      logger.info("Fetching category by ID", { id });
      const category = await categoryModel.findById(id).lean();
      if (!category) {
        logger.warn("Category not found", { id });
        throw new BadRequestError("Category not found");
      }
      logger.info("Category retrieved successfully", {
        id,
        name: category.name,
      });
      return {
        data: {
          _id: category._id,
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in getCategoryById", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid category ID");
      }
      throw err;
    }
  }

  static async updateCategory(id: string, body: UpdateCategoryBody) {
    try {
      // Validate input
      if (!body.name && !body.description) {
        logger.warn("No fields provided for update", { id });
        throw new ValidationError(
          "At least one field (name or description) must be provided"
        );
      }

      // Prepare update object
      const update: Partial<UpdateCategoryBody> = {};
      if (body.name) {
        update.name = body.name.trim();
        if (update.name.length < 2 || update.name.length > 50) {
          throw new ValidationError(
            "Category name must be between 2 and 50 characters"
          );
        }
        // Check if name is already taken by another category
        const existingCategory = await categoryModel.findOne({
          name: update.name,
          _id: { $ne: id },
        });
        if (existingCategory) {
          logger.warn("Category name already in use", { name: update.name });
          throw new BadRequestError("Category name already in use");
        }
      }
      if (body.description) {
        update.description = body.description.trim();
        if (update.description.length > 500) {
          throw new ValidationError(
            "Description must not exceed 500 characters"
          );
        }
      }

      logger.info("Updating category", { id, update });
      const category = await categoryModel
        .findByIdAndUpdate(
          id,
          { $set: update },
          { new: true, runValidators: true }
        )
        .lean();
      if (!category) {
        logger.warn("Category not found", { id });
        throw new BadRequestError("Category not found");
      }

      logger.info("Category updated successfully", { id, name: category.name });
      return {
        data: {
          _id: category._id,
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in updateCategory", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid category ID");
      }
      throw err;
    }
  }

  static async deleteCategory(id: string) {
    try {
      logger.info("Deleting category", { id });
      const category = await categoryModel.findByIdAndDelete(id).lean();
      if (!category) {
        logger.warn("Category not found", { id });
        throw new BadRequestError("Category not found");
      }
      logger.info("Category deleted successfully", { id, name: category.name });
      return { data: null };
    } catch (err) {
      logger.error("Error in deleteCategory", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid category ID");
      }
      throw err;
    }
  }
}
