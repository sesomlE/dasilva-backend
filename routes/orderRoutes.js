import express from 'express';
import axios from 'axios';
import Order from '../src/models/orderModel.js';

const router = express.Router();
const isDev = process.env.NODE_ENV !== 'production';

// POST /api/orders — create & verify order
router.post('/', async (req, res) => {
  try {
    const { user, cartItems, totalPrice, paymentReference } = req.body;
    console.log('💬 Incoming order:', req.body);

    // Basic validation
    if (!cartItems || !cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    if (!paymentReference) {
      return res.status(400).json({ message: 'Missing payment reference' });
    }

    // 1) Verify payment (skip in development)
    let txn;
    if (isDev) {
      console.log('⚙️ Skipping Paystack verification in dev mode');
      txn = { status: 'success', amount: totalPrice * 100 };
    } else {
      const verifyRes = await axios.get(
        `https://api.paystack.co/transaction/verify/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      txn = verifyRes.data.data;
    }

    // 2) Check verification result
    if (txn.status !== 'success') {
      return res.status(400).json({ message: 'Payment not verified', details: txn });
    }
    if (txn.amount !== totalPrice * 100) {
      return res.status(400).json({
        message: 'Amount mismatch',
        expected: totalPrice * 100,
        received: txn.amount,
      });
    }

    // 3) Sanitize cart items and save order
    const sanitizedItems = cartItems.map(({ _id, ...rest }) => rest);
    const saved = await Order.create({
      user,
      cartItems: sanitizedItems,
      totalPrice,
      paymentReference,
    });

    console.log('✅ Saved order:', saved);
    return res.status(201).json({ message: 'Order saved!', order: saved });

  } catch (err) {
    console.error('❌ Order error:', err);
    return res.status(500).json({
      message: err.response?.data?.message || err.message || 'Unknown error',
      full: err.response?.data || err.stack,
    });
  }
});

// GET /api/orders — list all orders
router.get('/', async (req, res) => {
  try {
    const list = await Order.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('❌ Fetch orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;
