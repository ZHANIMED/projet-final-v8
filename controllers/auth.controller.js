const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  sendWelcomeEmail,
  sendAdminNewUserAlert,
  sendAdminLoginAlert,
} = require("../config/mailer");
const Notification = require("../models/Notification");

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "E-mail déjà utilisé" });

    const user = await User.create({ name, email, password, isAdmin: false });
    const token = signToken(user);

    // Emails (non-bloquants) - catch errors just in case
    sendWelcomeEmail(user).catch(e => console.error("Welcome email error:", e));

    // Notification admin au lieu de mail
    await Notification.create({
      message: `Nouvel utilisateur inscrit : ${user.name}`,
      type: "register",
      userId: user._id
    }).catch(e => console.error("Notification error:", e));

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        photo: user.photo,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Identifiants invalides" });

    if (user.isBanned) {
      return res.status(403).json({ message: "Votre compte a été bloqué par un administrateur." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Identifiants invalides" });

    const token = signToken(user);

    // Alerte connexion admin (Notification au lieu de mail)
    await Notification.create({
      message: `Connexion de l'utilisateur : ${user.name}`,
      type: "login",
      userId: user._id
    }).catch(e => console.error("Notification error:", e));

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        photo: user.photo,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (user.isBanned) {
      return res.status(403).json({ message: "Votre compte a été bloqué." });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        photo: user.photo,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    next(err);
  }
};