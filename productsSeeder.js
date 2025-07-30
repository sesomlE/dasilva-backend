// seeders/productsSeeder.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from './src/models/productModel.js';

dotenv.config();

const perfumes = Array.from({ length: 26 }, (_, i) => {
  const name = `Perfume ${String.fromCharCode(65 + i)}`;
  return {
    name,
    price: 13000 + i * 500,
    image: `/images/perfume-${i + 1}.jpg`, // You can update to real image paths later
    description: `This is a description for ${name}.`,
    notes: "Top: Citrus, Middle: Floral, Base: Woody",
  };
});

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();
    const created = await Product.insertMany(perfumes);
    console.log(`✅ Seeded ${created.length} products`);
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedProducts();
