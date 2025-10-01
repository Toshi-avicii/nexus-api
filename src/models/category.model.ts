import { Document, model, Model, models, Schema } from "mongoose";
import logger from "../utils/logger";

// Define Category interface
interface Category extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define CategoryModel type
interface CategoryModel extends Model<Category> {}

const categorySchema = new Schema<Category, CategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minLength: [2, "Category name must be at least 2 characters long"],
      maxLength: [50, "Category name must not exceed 50 characters"],
      unique: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxLength: [500, "Description must not exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for name
// categorySchema.index({ name: 1 });

categorySchema.pre<Category>("save", async function (next) {
  try {
    logger.info("Saving category", { name: this.name });
    next();
  } catch (err) {
    logger.error("Error in category pre-save middleware", { error: err });
    next(err instanceof Error ? err : new Error("Unknown error in pre-save"));
  }
});

const categoryModel: CategoryModel = models.Category || model<Category, CategoryModel>("Category", categorySchema);

export default categoryModel;