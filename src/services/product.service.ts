import mongoose, { MongooseError, ObjectId } from "mongoose";
import productModel from "../models/product.model";
import categoryModel from "../models/category.model";
import { ValidationError, BadRequestError } from "../utils/errors";
import logger from "../utils/logger";
import { MetaField, Option, Variant } from "../types/product";
import fs from "fs/promises";
import path from "node:path";
import XLSX from 'xlsx';
// import { PROUDCT_TYPES } from "../types/product";

enum PROUDCT_TYPES {
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  OTHER = 'other'
}

interface CreateProductBody {
  productType: "clothing" | "electronics" | "furniture" | "other";
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category: string[];
  images?: string[];
  isActive?: boolean;
  discount?: number;
  variants?: Variant[];
  options: Option[];
  metaFields: MetaField[];
  productStatus: 'draft' | 'published';
}

interface GetAllProductsQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

interface UpdateProductBody {
  productType: "clothing" | "electronics" | "furniture" | "other";
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string[];
  images?: string[];
  isActive?: boolean;
  discount: number;
  variants?: Variant[];
  options?: Option[];
  metaFields?: MetaField[];
  productStatus: "draft" | "published";
}

export default class ProductService {
  static async createProduct(body: CreateProductBody) {
    try {
      // Validate input
      if (!body.name) {
        logger.warn("Product name is required");
        throw new ValidationError("Product name is required");
      }
      if (!body.price || body.price < 0) {
        logger.warn("Valid product price is required");
        throw new ValidationError("Valid product price is required");
      }
      if (!body.category) {
        logger.warn("Category is required");
        throw new ValidationError("Category is required");
      }

      // Check if category exists
      const categoryExists = await categoryModel.find({
        _id: { $in: body.category }
      }).lean();
      if (!categoryExists) {
        logger.warn("Category not found", { category: body.category });
        throw new ValidationError("Category not found");
      }

      // Check if product already exists
      const existingProduct = await productModel.findOne({
        name: body.name.trim(),
      });
      if (existingProduct) {
        logger.warn("Product already exists", { name: body.name });
        throw new BadRequestError("Product with this name already exists");
      }

      if (!['clothing', 'furniture', 'other', 'electronics'].includes(body.productType)) {
        logger.warn("Product type is not valid", { productType: body.productType });
        throw new BadRequestError("Invalid product type");
      }

      // Create new product
      logger.info("Creating new product", { name: body.name });
      const uniqueCategories = Array.from(new Set(body.category));
      const newProduct = await productModel.create({
        productType: body.productType,
        name: body.name.trim(),
        description: body.description?.trim(),
        price: body.price,
        stock: body.stock ?? 0,
        category: uniqueCategories,
        images: body.images || [],
        isActive: body.isActive ?? true,
        discount: body.discount || 0,
        variants: body.variants,
        options: body.options,
        metaFields: body.metaFields,
        productStatus: body.productStatus
      });

      logger.info("Product created successfully", {
        name: newProduct.name,
        _id: newProduct._id,
      });
      return {
        data: {
          _id: newProduct._id,
          productType: newProduct.productType,
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          discount: newProduct.discount,
          stock: newProduct.stock,
          category: newProduct.category,
          images: newProduct.images,
          isActive: newProduct.isActive,
          variants: newProduct.variants,
          options: newProduct.options,
          metaFields: newProduct.metaFields,
          createdAt: newProduct.createdAt,
          updatedAt: newProduct.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in createProduct", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }
  }

  static async getAllProducts(query: GetAllProductsQuery) {
    try {
      logger.info("Fetching all products with filters", { query });

      // Build query filters
      const filter: any = { isActive: true }; // Only fetch active products

      // Category filter
      if (query.category) {
        const categoryExists = await categoryModel.findById(query.category).lean();
        if (!categoryExists) {
          logger.warn("Category not found", { category: query.category });
          throw new BadRequestError("Category not found");
        }
        filter.category = query.category;
      }

      // Price range filter
      if (query.minPrice !== undefined) {
        filter.price = { ...filter.price, $gte: query.minPrice };
      }
      if (query.maxPrice !== undefined) {
        filter.price = { ...filter.price, $lte: query.maxPrice };
      }

      // Search filter (case-insensitive)
      if (query.search) {
        filter.name = { $regex: query.search, $options: "i" };
      }

      // Pagination
      const page = query.page ? parseInt(query.page.toString(), 10) : 1;
      const limit = query.limit ? parseInt(query.limit.toString(), 10) : 10;
      const skip = (page - 1) * limit;

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        logger.warn("Invalid pagination parameters", { page, limit });
        throw new ValidationError("Page and limit must be positive numbers");
      }

      // Fetch products and total count
      const [products, total] = await Promise.all([
        productModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .populate("category", "name")
          .lean(),
        productModel.countDocuments(filter),
      ]);

      logger.info("Products retrieved successfully", {
        count: products.length,
        total,
      });

      return {
        data: products.map((product) => ({
          _id: product._id,
          productType: product.productType,
          status: product.productStatus,
          name: product.name,
          description: product.description,
          price: product.price,
          discount: product.discount,
          stock: product.stock,
          category: product.category,
          images: product.images,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          variants: product.variants,
          options: product.options,
          metaFields: product.metaFields
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      logger.error("Error in getAllProducts", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid query parameters");
      }
      throw err;
    }
  }

  static async getProductById(id: string) {
    try {
      logger.info("Fetching product by ID", { id });
      const product = await productModel
        .findById(id)
        .populate("category", "name")
        .lean();
      if (!product) {
        logger.warn("Product not found", { id });
        throw new BadRequestError("Product not found");
      }
      logger.info("Product retrieved successfully", {
        id,
        name: product.name,
      });
      return {
        data: {
          _id: product._id,
          productType: product.productType,
          name: product.name,
          description: product.description,
          price: product.price,
          discount: product.discount,
          stock: product.stock,
          category: product.category,
          images: product.images,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          variants: product.variants,
          options: product.options,
          metaFields: product.metaFields
        },
      };
    } catch (err) {
      logger.error("Error in getProductById", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid product ID");
      }
      throw err;
    }
  }

  static async updateProduct(id: string, body: UpdateProductBody) {
    try {
      // Validate input
      if (
        !body.name &&
        !body.description &&
        body.price === undefined &&
        body.stock === undefined &&
        !body.category &&
        // !body.images &&
        body.isActive === undefined &&
        !body.variants &&
        !body.options &&
        !body.metaFields
      ) {
        logger.warn("No fields provided for update", { id });
        throw new ValidationError(
          "At least one field must be provided for update"
        );
      }

      // Prepare update object
      const update: Partial<UpdateProductBody> = {};
      if (['clothing', 'furniture', 'other', 'electronics'].includes(body.productType)) {
        update.productType = body.productType;
      }

      if (body.name) {
        update.name = body.name.trim();
        if (update.name.length < 2 || update.name.length > 100) {
          throw new ValidationError(
            "Product name must be between 2 and 100 characters"
          );
        }
        // Check if name is already taken by another product
        // const existingProduct = await productModel.findOne({
        //   name: update.name,
        //   _id: { $ne: id },
        // });
        // if (existingProduct) {
        //   logger.warn("Product name already in use", { name: update.name });
        //   throw new BadRequestError("Product name already in use");
        // }
      }
      if (body.description) {
        update.description = body.description.trim();
        if (update.description.length > 1000) {
          throw new ValidationError(
            "Description must not exceed 1000 characters"
          );
        }
      }
      if (body.price !== undefined) {
        if (body.price < 0) {
          throw new ValidationError("Price cannot be negative");
        }
        update.price = body.price;
      }
      if (body.stock !== undefined) {
        if (body.stock < 0) {
          throw new ValidationError("Stock cannot be negative");
        }
        update.stock = body.stock;
      }
      if (body.category) {
        const categoryExists = await categoryModel.findById(body.category).lean();
        if (!categoryExists) {
          logger.warn("Category not found", { category: body.category });
          throw new BadRequestError("Category not found");
        }
        update.category = body.category;
      }
      if (body.images) {
        update.images = body.images;
      }
      if (body.isActive !== undefined) {
        update.isActive = body.isActive;
      }

      if (body.variants !== undefined) {
        update.variants = body.variants;
      }

      if (body.options !== undefined) {
        update.options = body.options;
      }

      if (body.metaFields !== undefined) {
        update.metaFields = body.metaFields;
      }

      update.productStatus = body.productStatus;

      logger.info("Updating product", { id, update });
      const existingProductImages = await productModel.findOne({ _id: id }, { images: true });

      if (existingProductImages && existingProductImages?.images.length > 0) {
        existingProductImages.images.map(async (img) => {
          try {
            const relativePath = img.split("uploads/")[1];
            if (!relativePath) return;
            const imgPath = path.join(process.cwd(), "uploads", relativePath);
            console.log({ imgPath });
            await fs.unlink(imgPath);
            logger.info(`File deleted: ${imgPath}`);
          } catch (err: any) {
            if (err.code !== "ENOENT") {
              logger.error("Failed to delete image", {
                image: img,
                error: err.message,
              });
            }
          }
        })
      }

      const product = await productModel
        .findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
        .populate("category", "name")
        .lean();
      if (!product) {
        logger.warn("Product not found", { id });
        throw new BadRequestError("Product not found");
      }

      logger.info("Product updated successfully", { id, name: product.name });
      return {
        data: {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          discount: product.discount,
          stock: product.stock,
          category: product.category,
          images: product.images,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      };
    } catch (err) {
      logger.error("Error in updateProduct", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid product ID");
      }
      throw err;
    }
  }

  static async deleteProduct(id: string) {
    try {
      logger.info("Deleting product", { id });
      const existingProductImages = await productModel.findOne({ _id: id }, { images: true });
      const product = await productModel.findByIdAndDelete(id).lean();
      if (!product) {
        logger.warn("Product not found", { id });
        throw new BadRequestError("Product not found");
      } else {
        if (existingProductImages && existingProductImages?.images.length > 0) {
          existingProductImages.images.map(async (img) => {
            try {
              const relativePath = img.split("uploads/")[1];
              if (!relativePath) return;
              const imgPath = path.join(process.cwd(), "uploads", relativePath);
              await fs.unlink(imgPath);
              logger.info(`File deleted: ${imgPath}`);
            } catch (err: any) {
              if (err.code !== "ENOENT") {
                logger.error("Failed to delete image", {
                  image: img,
                  error: err.message,
                });
              }
            }
          })
        }
      }
      logger.info("Product deleted successfully", { id, name: product.name });
      return { data: null };
    } catch (err) {
      logger.error("Error in deleteProduct", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid product ID");
      }
      throw err;
    }
  }

  static async bulkProductUpload(file: Express.Multer.File) {
    try {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<any>(sheet, {
        defval: null,
        range: 1
      });

      const categoryList = await categoryModel.find({}, { name: 1 }).lean();
      const categoryMap = new Map<string, mongoose.Schema.Types.ObjectId>();

      categoryList.forEach(cat => {
        categoryMap.set(cat.name.toLowerCase(), cat._id as ObjectId);
      })

      const parseImages = (raw?: string): string[] =>
        raw ? raw.split(",").map(i => i.trim()).filter(Boolean) : [];

      const parseVariantOptions = (raw?: string) => {
        if (!raw) return [];

        return raw
          .split(",")
          .map(pair => {
            const [key, value] = pair.split(":");

            if (!key || !value) return null;

            return {
              key: key.trim(),
              value: value.trim()
            };
          })
          .filter(Boolean);
      };

      const validProductTypes = ['clothing', 'other', 'electronics', 'furniture'];
      const validProductStatuses = ['published', 'draft'];

      const validProductRows = rows.map(row => {
        if (validProductStatuses.includes(row.productStatus) && validProductTypes.includes(row.productType)) {
          let categoryNames = (row.category as string).split(',').map(item => item.toLowerCase().trim());
          const product = {
            name: row.name,
            productType: row.productType,
            productStatus: row.productStatus,
            price: Number(row.price),
            discount: Number(row.discount ?? 0),
            stock: Number(row.stock ?? 0),

            category: categoryNames.map(slug => {
              const id = categoryMap.get(slug);
              return id;
            }).filter(id => id),

            images: parseImages(row.images),
            isActive: true,

            variants: row.variant_sku
              ? [{
                sku: row.variant_sku,
                price: Number(row.variant_price),
                stock: Number(row.variant_stock),
                options: parseVariantOptions(row.variant_options)
              }]
              : [],

            options: row.option_name
              ? [{
                name: row.option_name,
                values: row.option_value
                  ?.split(",")
                  .map((v: string) => v.trim())
              }]
              : [],

            metaFields: row.mf_namespace
              ? [{
                namespace: row.mf_namespace,
                key: row.mf_key,
                type: row.mf_type || "string",
                value: row.mf_value
              }]
              : []
          }
          return product;
        }
      }).filter(item => item);

      const failedProductRows = rows.map((row, rowIdx) => {
        if (!validProductStatuses.includes(row.productStatus)) {
          return {
            error: `${row.productStatus} is not a valid product status`,
            rowNo: rowIdx + 1,
            row: {
              name: row.name,
              productType: row.productType,
              productStatus: row.productStatus
            },
          }
        } else if (!validProductTypes.includes(row.productType)) {
          return {
            error: `${row.productType} is not a valid product type`,
            rowNo: rowIdx + 1,
            row: {
              name: row.name,
              productType: row.productType,
              productStatus: row.productStatus
            },
          }
        }
      }).filter(item => item);

      if (validProductRows.length > 0) {
        const insertedRows = await productModel.insertMany(validProductRows);
        return {
          success: true,
          data: {
            insertedRows,
            rejectedRows: failedProductRows
          },
          message: `${insertedRows.length} rows inserted successfully, ${failedProductRows.length} rows rejected`
        }
      } else {
        return {
          success: true,
          data: {
            insertedRows: validProductRows,
            rejectedRows: failedProductRows
          },
          message: `${validProductRows.length} rows inserted successfully, ${failedProductRows.length} rows rejected`
        }
      }
    } catch (err) {
      logger.error("Error in bulkProductUpload", { error: err });
      if (err instanceof MongooseError) {
        throw new BadRequestError("Invalid product ID");
      }
      throw err;
    }
  }
}