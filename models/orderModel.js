import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },   // ✅ use "name"
    email: { type: String, required: true },
    phoneno: { type: String, required: true }, 
    address: { type: String, required: true }, 

    orderItems: [orderItemSchema],

    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: "Pending" },

    shippingMethod: { type: String, required: true },
    shippingStatus: { type: String, default: "Pending" },

    orderTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
