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