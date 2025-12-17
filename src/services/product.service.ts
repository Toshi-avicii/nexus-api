import { MongooseError } from "mongoose";
import productModel from "../models/product.model";
import categoryModel from "../models/category.model";
import { ValidationError, BadRequestError } from "../utils/errors";
import logger from "../utils/logger";
import { MetaField, Option, Variant } from "../types/product";
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
  // images?: string[];
  isActive?: boolean;
  discount?: number;
  variants?: Variant[];
  options: Option[];
  metaFields: MetaField[];
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
  // images?: string[];
  isActive?: boolean;
  discount: number;
  variants?: Variant[];
  options?: Option[];
  metaFields?: MetaField[];
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
        // images: body.images || [],
        isActive: body.isActive ?? true,
        discount: body.discount || 0,
        variants: body.variants,
        options: body.options,
        metaFields: body.metaFields
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
        const existingProduct = await productModel.findOne({
          name: update.name,
          _id: { $ne: id },
        });
        if (existingProduct) {
          logger.warn("Product name already in use", { name: update.name });
          throw new BadRequestError("Product name already in use");
        }
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
      // if (body.images) {
      //   update.images = body.images;
      // }
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

      logger.info("Updating product", { id, update });
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
      const product = await productModel.findByIdAndDelete(id).lean();
      if (!product) {
        logger.warn("Product not found", { id });
        throw new BadRequestError("Product not found");
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
}