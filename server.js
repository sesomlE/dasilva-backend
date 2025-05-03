import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import Order from './models/orderModel.js'; // now this works ✅

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

/**
 * POST /api/order
 * Verifies Paystack payment reference, then saves order to MongoDB
 */
app.post('/api/order', async (req, res) => {
  const { user, cartItems, totalPrice, paymentReference } = req.body;

  if (!paymentReference) {
    return res.status(400).json({ message: 'Missing payment reference' });
  }

  try {
    // Verify payment with Paystack
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const status = verifyRes.data.data.status;
    if (status !== 'success') {
      return res.status(400).json({ message: 'Payment not verified' });
    }
  } catch (err) {
    console.error('Paystack verification error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Payment verification failed' });
  }

  try {
    // Save the order in MongoDB
    const newOrder = new Order({ user, cartItems, totalPrice, paymentReference });
    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully!', order: savedOrder });
  } catch (err) {
    console.error('MongoDB save error:', err);
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
