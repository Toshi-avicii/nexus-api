import z from "zod";

/* ----------------------------------
   ENUMS
---------------------------------- */
export const PRODUCT_TYPES = ["clothing", "electronics", "furniture", "other"] as const;

/* ----------------------------------
   META FIELD SCHEMA
---------------------------------- */
export const metaFieldSchema = z.object({
  namespace: z.string().min(1, "namespace is required"),
  key: z.string().min(1, "key is required"),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({}).loose(), // allows any object
    z.array(z.any()),
  ]),
  type: z.string().default("string"),
});

/* ----------------------------------
   OPTION SCHEMA
---------------------------------- */
export const optionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  values: z.array(z.string().min(1)).default([]),
});

/* ----------------------------------
   VARIANT SCHEMA
---------------------------------- */
export const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.number().nonnegative("Price cannot be negative"),
  stock: z.number().nonnegative("Stock cannot be negative"),
  options: z.record(z.string(), z.string()).default({}), // e.g. { size: "L", color: "Red" }
});

/* ----------------------------------
   MAIN PRODUCT SCHEMA
---------------------------------- */
export const productSchema = z.object({
  body: z.object({

    productType: z.enum(PRODUCT_TYPES, {
      error: 'product type is invalid'
    }),
  
    name: z.string()
      .min(2, "Product name must be at least 2 characters long")
      .max(100, "Product name must not exceed 100 characters"),
  
    description: z.string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),
  
    price: z.number()
      .nonnegative("Price cannot be negative"),
  
    discount: z.number()
      .min(0, "Discount cannot be negative")
      .default(0),
  
    stock: z.number()
      .min(0, "Stock cannot be negative")
      .default(0),
  
    category: z.array(
      z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ObjectId")
    ).min(1, "At least one category is required"),
  
    images: z.array(
      z.string().regex(
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i,
        "Invalid image URL"
      )
    ).optional().default([]),
  
    isActive: z.boolean().default(true),
  
    variants: z.array(variantSchema).optional().default([]),
    options: z.array(optionSchema).optional().default([]),
    metaFields: z.array(metaFieldSchema).optional().default([]),
  })
});