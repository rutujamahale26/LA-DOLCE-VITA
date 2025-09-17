import mongoose from "mongoose";

const validGenders = ["male", "female", "unisex"];
const validSizes = ["XS", "S", "M", "L", "XL"];

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true, trim: true },
    product_id: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    tiktok_session_id: { type: String },
    gender: { type: String, enum: validGenders, required: true },
    color: { type: String },
    size: { type: String, enum: validSizes, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: "Maximum 4 images allowed",
      },
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
