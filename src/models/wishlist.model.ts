import { Schema, model, Types } from "mongoose";

interface IWishlist {
  user: Types.ObjectId;
  items: {
    product: Types.ObjectId;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const wishlistSchema = new Schema<IWishlist>(
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
      },
    ],
  },
  { timestamps: true }
);

export default model<IWishlist>("Wishlist", wishlistSchema, "wishlists");