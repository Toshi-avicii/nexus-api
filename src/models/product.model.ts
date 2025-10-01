import mongoose, { Document, model, Model, models, Schema, Types } from "mongoose";
import logger from "../utils/logger";

// Define Product interface
interface Product extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: Schema.Types.ObjectId[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define ProductModel type
interface ProductModel extends Model<Product> { }

const productSchema = new Schema<Product, ProductModel>(
  {
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