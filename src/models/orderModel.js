import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
    },
    cartItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Default export
const Order = mongoose.model('Order', orderSchema);
export default Order;
