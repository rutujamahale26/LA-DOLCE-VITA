import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true },
      customerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      email: { type: String, required: true },
      phoneno: { type: String, required: true },
    },
    orderDetails: {
      orderID: { type: String, required: true },
      transactionID: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      paymentMethod: { type: String, required: true },
      paymentStatus: { type: String, default: "Pending" },
      deliveryStatus: { type: String, default: "Pending" },
      date: { type: Date, default: Date.now },
      notes: { type: String, maxlength: 1000 },
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
