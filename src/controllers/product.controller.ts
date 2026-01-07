import { NextFunction, Request, Response } from "express";
import ProductService from "../services/product.service";
import logger from "../utils/logger";
import { ProductInput } from "../types/product";
import { BadRequestError } from "../utils/errors";
import XLSX from 'xlsx';
import categoryModel from "../models/category.model";
import mongoose, { ObjectId } from "mongoose";
import productModel from "../models/product.model";

interface CreateProductRequest extends Request<{}, {}, { product: ProductInput | string }> {
  files?: Express.Multer.File[]
  | { [fieldname: string]: Express.Multer.File[] }
  | undefined
}

interface UpdateProductRequest extends Request<{ id: string }, {}, { product: ProductInput | string }> {
  files?: Express.Multer.File[]
  | { [fieldname: string]: Express.Multer.File[] }
  | undefined
}

export const createProduct = async (
  req: CreateProductRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (typeof req.body.product === "string") {
      const files = req.files as Express.Multer.File[];

      const imageUrls = files.map(file =>
        `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
      );
      const {
        name,
        description,
        price,
        stock,
        category,
        // images, 
        isActive, productType, variants, options, metaFields, discount, productStatus } = JSON.parse(req.body.product) as ProductInput;
      const data = await ProductService.createProduct({
        productType,
        name,
        description,
        price,
        stock,
        category,
        images: imageUrls,
        isActive,
        variants,
        options,
        metaFields,
        discount,
        productStatus
      });
      logger.info("Product created successfully", { name });
      res.status(201).json(data);
    } else {
      throw new BadRequestError("Invalid data");
    }
  } catch (err) {
    logger.error("Error occurred in createProduct", { error: err });
    next(err);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, minPrice, maxPrice, search, page, limit } = req.query;
    const data = await ProductService.getAllProducts({
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    logger.info("Products retrieved successfully");
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getAllProducts", { error: err });
    next(err);
  }
};

export const getAllDeletedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, minPrice, maxPrice, search, page, limit } = req.query;
    const data = await ProductService.getAllDeletedProducts({
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    logger.info("Deleted Products retrieved successfully");
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getAllDeletedProducts", { error: err });
    next(err);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await ProductService.getProductById(id);
    logger.info("Product retrieved successfully", { id });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in getProductById", { error: err });
    next(err);
  }
};

export const updateProduct = async (
  req: UpdateProductRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log({ productId: id });
    if (typeof req.body.product === 'string') {
      const files = req.files as Express.Multer.File[];
      const imageUrls = files.map(file =>
        `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
      );

      const {
        name,
        description,
        price,
        stock,
        category,
        // images, 
        isActive,
        productType,
        discount,
        metaFields,
        options,
        variants,
        productStatus
      } = JSON.parse(req.body.product) as ProductInput;
      const data = await ProductService.updateProduct(id, {
        productType,
        name,
        description,
        price,
        stock,
        category,
        images: imageUrls,
        isActive,
        discount,
        variants,
        options,
        metaFields,
        productStatus
      });
      logger.info("Product updated successfully", { id, name: data.data.name });
      res.status(200).json(data);
    }
  } catch (err) {
    logger.error("Error occurred in updateProduct", { error: err });
    next(err);
  }
};

export const softDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await ProductService.softDeleteProduct(id);
    if (result) {
      logger.info("Product deleted successfully", { id });
      res.status(200).json({
        message: "Product deleted successfully",
        id,
      });
    } else {
      throw new Error("Could not delete product");
    }
  } catch (err) {
    logger.error("Error occurred in deleteProduct", { error: err });
    next(err);
  }
};

export const hardDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await ProductService.hardDeleteProduct(id);
    if (result) {
      logger.info("Product deleted successfully", { id });
      res.status(200).json({
        message: "Product deleted successfully",
        id,
      });
    } else {
      throw new Error("Could not delete product");
    }
  } catch (err) {
    logger.error("Error occurred in deleteProduct", { error: err });
    next(err);
  }
};

export const bulkUploadProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const result = await ProductService.bulkProductUpload(req.file)
    res.status(200).json(result);
  } catch (err) {
    logger.error("Error occurred in bulkUploadProducts", { error: err });
    next(err);
  }
}

export const softDeleteManyProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productIds } = req.body;
    const result = await ProductService.softDeleteProducts(productIds);
    if (result.success) {
      res.status(200).json({
        message: `${result.foundedProducts.matchedCount} Products deleted successfully`,
        deletedCount: result.foundedProducts.matchedCount,
      });
    } else {
      res.status(400).json({ success: false, message: "Error occurred" })
    }
  } catch (err) {
    logger.error("Error occurred in deleteManyProducts", { error: err });
    next(err);
  }
}

export const hardDeleteManyProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productIds } = req.body;
    const result = await ProductService.hardDeleteProducts(productIds);
    if (result.success) {
      res.status(200).json({
        success: result.success,
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} products deleted permanently`
      });
    } else {
      res.status(400).json({ success: false, message: "Error occurred" })
    }
  } catch (err) {
    logger.error("Error occurred in deleteManyProducts", { error: err });
    next(err);
  }
}

export const moveProductFromBin = async (req: Request, res: Response, next: NextFunction) => {
  try { 
    const { id } = req.params;
    const result = await ProductService.moveProductFromBin(id);
    if(result?.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ success: false, message: "Error occurred" })
    }
  } catch (err) {
    logger.error("Error occurred in moveProductFromBin", { error: err });
    next(err);
  }
}