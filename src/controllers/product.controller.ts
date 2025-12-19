import { NextFunction, Request, Response } from "express";
import ProductService from "../services/product.service";
import logger from "../utils/logger";
import { ProductInput } from "../types/product";
import { BadRequestError } from "../utils/errors";

interface CreateProductRequest extends Request<{}, {}, { product: ProductInput | string }> {
  files?: Express.Multer.File[]
  | { [fieldname: string]: Express.Multer.File[] }
  | undefined
}

export const createProduct = async (
  req: CreateProductRequest,
  res: Response,
  next: NextFunction
) => {
  console.log({
    files: req.files,
    body: req.body
  })
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
        isActive, productType, variants, options, metaFields } = JSON.parse(req.body.product) as ProductInput;
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
        metaFields
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
  req: Request<{ id: string }, {}, ProductInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
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
      variants
    } =
      req.body;
    const data = await ProductService.updateProduct(id, {
      productType,
      name,
      description,
      price,
      stock,
      category,
      // images,
      isActive,
      discount,
      variants,
      options,
      metaFields
    });
    logger.info("Product updated successfully", { id, name: data.data.name });
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in updateProduct", { error: err });
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
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