import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    customerDetails: {
      customerName: { type: String },
      customerID: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
      email: { type: String },
      phoneNumber: { type: String},
    },
    orderDetails: {
      orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order"}, 
      transactionID: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      paymentMethod: { type: String, required: true },
      paymentStatus: { type: String },
      deliveryStatus: { type: String },
      date: { type: Date, default: Date.now },
      notes: { type: String, maxlength: 1000 },
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
