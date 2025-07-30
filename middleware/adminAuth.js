// middleware/adminAuth.js
export const adminAuth = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token || token !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
  
    next();
  };
  