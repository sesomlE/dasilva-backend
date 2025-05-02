import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// POST /api/order
router.post('/', async (req, res) => {
  try {
    const { customer, item, quantity } = req.body;
    const order = new Order({ customer, item, quantity });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/order
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
