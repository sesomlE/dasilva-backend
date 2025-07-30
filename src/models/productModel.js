import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String, // or imageUrl
  category: String,
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
