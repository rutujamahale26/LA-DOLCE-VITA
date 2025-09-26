import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    productCode: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    tiktok_session_id: { type: String },
    gender: { type: String, required: true },
    color: { type: String },
    size: { type: String,  required: true },
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
