// utils/ensureDefaultCategory.ts
import categoryModel from "../models/category.model";

export async function ensureDefaultCategory() {
  let category = await categoryModel.findOne({ name: "Uncategorized" });

  if (!category) {
    category = await categoryModel.create({
      name: "Uncategorized",
      description: "Default category for uncategorized items",
    });
  }

  return category;
}
