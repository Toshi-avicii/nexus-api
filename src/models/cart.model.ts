import { Schema, model, Types } from "mongoose";

interface ICart {
  user: Types.ObjectId;
  items: {
    product: Types.ObjectId;
    quantity: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
  },
  { timestamps: true }
);

export default model<ICart>("Cart", cartSchema, "carts");