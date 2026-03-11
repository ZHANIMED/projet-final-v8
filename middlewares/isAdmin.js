module.exports = function isAdmin(req, res, next) {
  console.log(`🛡️ isAdmin check: user is ${req.user?.isAdmin ? "ADMIN" : "NOT ADMIN"} (ID: ${req.user?.id})`);
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  next();
};