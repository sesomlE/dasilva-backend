import express from 'express';
import axios from 'axios';
import { body, validationResult } from 'express-validator';
import Order from '../src/models/orderModel.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();
const isDev = process.env.NODE_ENV !== 'production';

// Validators for incoming order data
const validateOrder = [
  body('user').notEmpty().withMessage('User is required'),
  body('cartItems')
    .isArray({ min: 1 })
    .withMessage('Cart items must be a non-empty array'),
  body('cartItems.*.item').notEmpty().withMessage('Item name is required'),
  body('cartItems.*.price')
    .isFloat({ gt: 0 })
    .withMessage('Item price must be greater than 0'),
  body('cartItems.*.quantity')
    .isInt({ gt: 0 })
    .withMessage('Item quantity must be greater than 0'),
  body('totalPrice')
    .isFloat({ gt: 0 })
    .withMessage('Total price must be a positive number'),
  body('paymentReference')
    .notEmpty()
    .withMessage('Payment reference is required'),
];

// POST /api/orders — create & verify order
router.post('/', validateOrder, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { user, cartItems, totalPrice, paymentReference } = req.body;
    console.log('💬 Incoming order:', req.body);

    // Verify payment (skip in development)
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

    // Check payment verification
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

    // Sanitize cart items and save order
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

// Only admin can view al orders
router.get('/', adminAuth, async (req, res) => {
  try {
    const list = await Order.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.erroe('V Fetch orders error:', err);
    res.status(500).json({message: 'Failed to fetch orders' });
  }
});

export default router;
