// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js'; // ✅ NEW: Product Routes

dotenv.config();

const app = express();

// 🔐 Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// 🌐 CORS & JSON
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000'], // your frontend URL
    credentials: true,
  })
);

// 📦 Routes
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes); // ✅ NEW: Product route added

// 🔌 Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 📝 Logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
