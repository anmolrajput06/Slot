const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_secret_key";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.playerId = decoded.playerId;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = authMiddleware;
