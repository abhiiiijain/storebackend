const authMiddleware = (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (!req.session.userId) {
      return res.status(401).json({ message: "Access denied. Please login." });
    }

    // Add user info to request
    req.user = {
      userId: req.session.userId,
      email: req.session.email
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Authentication failed." });
  }
};

module.exports = authMiddleware; 