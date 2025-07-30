import express from 'express';
import Product from '../src/models/productModel.js'; // Make sure this exists

const router = express.Router();

// GET /api/products — get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    res.json(products);
  } catch (err) {
    console.error('❌ Fetch products error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});
// GET /api/products/:id — get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('❌ Fetch single product error:', err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});


export default router;
