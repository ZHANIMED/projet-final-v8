const router = require("express").Router();
const User = require("../models/User");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const uploadUser = require("../middlewares/uploadUser");

// GET /api/users/profile - Profil de l'utilisateur connecté
router.get("/profile", isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile - Mettre à jour le profil
router.put("/profile", isAuth, uploadUser.single("photo"), async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const update = {};

    if (name) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;

    if (req.file) {
      update.photo = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /api/users - Lister tous les utilisateurs (Admin)
router.get("/", isAuth, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/toggle-admin - Basculer le rôle admin (Admin)
router.patch("/:id/toggle-admin", isAuth, isAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Empêcher de rétrograder son propre compte
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ message: "Impossible de modifier votre propre rôle" });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      message: user.isAdmin ? "Utilisateur promu administrateur" : "Droits admin retirés",
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/toggle-ban - Bannir / Débannir (Admin)
router.patch("/:id/toggle-ban", isAuth, isAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Empêcher de bannir son propre compte
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ message: "Impossible de bannir votre propre compte" });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: user.isBanned ? "Utilisateur banni" : "Utilisateur débanni",
      user: { id: user._id, name: user.name, isBanned: user.isBanned }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;