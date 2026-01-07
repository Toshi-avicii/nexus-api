import mongoose, { Document, model, Model, models, Schema, Types } from "mongoose";
import logger from "../utils/logger";
import { MetaField, Option, Variant } from "../types/product";

enum PROUDCT_TYPES {
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  OTHER = 'other'
}

enum PRODUCT_STATUSES {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

const metaFieldSchema = new Schema<MetaField>({
  namespace: { type: String, required: [true, "namespace is required"] },
  key: { type: String, required: [true, "key is required"] },
  value: mongoose.Schema.Types.Mixed,
  type: { type: String, default: "string" }
}, { _id: false });

const variantSchema = new mongoose.Schema<Variant>({
  sku: { type: String, required: [true, 'SKU is required'] },
  price: { type: Number, required: [true, 'variant price is required'] },
  stock: { type: Number, required: [true, 'variant stock is required'] },
  options: {type: mongoose.Schema.Types.Mixed, default: [] } // e.g. { size: "L", color: "Red" }
}, { _id: false });

const optionSchema = new mongoose.Schema<Option>({
  name: { type: String, required: true }, // e.g. "Color"
  values: [String] // e.g. ["Red", "Blue"]
}, { _id: false });

// Define Product interface
interface Product extends Document {
  productType: PROUDCT_TYPES;
  productStatus: PRODUCT_STATUSES;
  name: string;
  description?: string;
  price: number;
  discount: number;
  stock: number;
  category: Schema.Types.ObjectId[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  variants?: Variant[];
  options?: Option[];
  metaFields?: MetaField[];
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

// Define ProductModel type
interface ProductModel extends Model<Product> { }

const productSchema = new Schema<Product, ProductModel>(
  {
    productType: {
      type: String,
      required: [true, "product type is required"],
      enum: Object.values(PROUDCT_TYPES)
    },
    productStatus: {
      type: String,
      default: PRODUCT_STATUSES.DRAFT,
      enum: Object.values(PRODUCT_STATUSES)
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minLength: [2, "Product name must be at least 2 characters long"],
      maxLength: [100, "Product name must not exceed 100 characters"],
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxLength: [1000, "Description must not exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    category: [{
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      validate: {
        validator: async function (value) {
          const Category = model('Category');
          const exists = await Category.exists({ _id: value });
          return exists;
        },
        message: props => `"${props.value}" is not a valid category.`,
      }
    }],
    images: [
      {
        type: String,
        validate: {
          validator: function (v: string) {
            return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(v);
          },
          message: (props: { value: string }) =>
            `${props.value} is not a valid image URL!`,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    variants: [variantSchema],
    options: [optionSchema],
    metaFields: [metaFieldSchema]
  },
  {
    timestamps: true,
  }
);

productSchema.pre<Product>("save", async function (next) {
  try {
    logger.info("Saving product", { name: this.name });
    next();
  } catch (err) {
    logger.error("Error in product pre-save middleware", { error: err });
    next(err instanceof Error ? err : new Error("Unknown error in pre-save"));
  }
});

const productModel: ProductModel =
  models.Product || model<Product, ProductModel>("Product", productSchema);

export default productModel;