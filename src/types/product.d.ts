import { metaFieldSchema, optionSchema, productSchema, variantSchema } from "../validations/product.schema";

import z from 'zod';

export enum PROUDCT_TYPES {
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  OTHER = 'other'
}

export interface MetaField {
  namespace: string;
  key: string;
  value: any;
  type?: string;
}

export interface Variant {
  sku: string;
  price: number;
  stock: number;
  options: Record<string, any>;
}

export interface Option {
  name: string;
  values: string[];
}

export type ProductInput = z.infer<typeof productSchema>['body'];
export type VariantInput = z.infer<typeof variantSchema>;
export type OptionInput = z.infer<typeof optionSchema>;
export type MetaFieldInput = z.infer<typeof metaFieldSchema>;