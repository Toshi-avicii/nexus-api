import { Document, model, Model, models, Schema, Types } from "mongoose";
import logger from "../utils/logger";

// Define Order interface
interface Order extends Document {
  user: Types.ObjectId;
  items: {
    product: Schema.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "return requested"
    | "return approved"
    | "return rejected"
    | "returned"; // <-- ADD NEW STATUSES
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  payment?: Types.ObjectId;
  returnReason?: string; // <-- ADD THIS FIELD
  createdAt: Date;
  updatedAt: Date;
}

// Define OrderModel type
interface OrderModel extends Model<Order> {}

const orderSchema = new Schema<Order, OrderModel>(
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
          validate: {
            validator: async function (value) {
              const Product = model("Product");
              const exists = await Product.exists({ _id: value });
              return exists;
            },
            message: (props) => `"${props.value}" is not a valid product.`,
          },
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: [0, "Price cannot be negative"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "return requested",
        "return approved",
        "return rejected",
        "returned",
      ],
      default: "pending",
    },
    shippingAddress: {
      street: {
        type: String,
        trim: true,
        maxLength: [100, "Street must not exceed 100 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxLength: [50, "City must not exceed 50 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxLength: [50, "State must not exceed 50 characters"],
      },
      country: {
        type: String,
        trim: true,
        maxLength: [50, "Country must not exceed 50 characters"],
      },
      postalCode: {
        type: String,
        trim: true,
        maxLength: [20, "Postal code must not exceed 20 characters"],
      },
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    returnReason: {
      type: String,
      trim: true,
      maxLength: [500, "Return reason must not exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre<Order>("save", async function (next) {
  try {
    logger.info("Saving order", { user: this.user });
    next();
  } catch (err) {
    logger.error("Error in order pre-save middleware", { error: err });
    next(err instanceof Error ? err : new Error("Unknown error in pre-save"));
  }
});

const orderModel: OrderModel =
  models.Order || model<Order, OrderModel>("Order", orderSchema);

export default orderModel;
