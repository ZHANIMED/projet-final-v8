const jwt = require("jsonwebtoken");

module.exports = function isAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      console.log("❌ isAuth: No token provided");
      return res.status(401).json({ message: "Non autorisé" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "MYSECRETKEY");
    console.log(`🔐 isAuth: Decoded user ${decoded.id}, isAdmin: ${decoded.isAdmin}`);
    req.user = decoded; // { id, isAdmin }
    next();
  } catch (err) {
    console.log("❌ isAuth: Invalid token", err.message);
    return res.status(401).json({ message: "Jeton invalide" });
  }
};