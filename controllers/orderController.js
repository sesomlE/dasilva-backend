import Order from '../models/orderModel.js';

export const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
  
};
console.log(req.body)