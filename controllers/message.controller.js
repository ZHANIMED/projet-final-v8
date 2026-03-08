const AdminMessage = require("../models/AdminMessage");
const Notification = require("../models/Notification");

// User → create private message to admin
exports.create = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Le message ne peut pas être vide." });
    }

    const cleanContent = content.trim();

    const message = await AdminMessage.create({
      user: req.user.id,
      content: cleanContent,
    });

    // Create a notification for admin(s)
    try {
      const short =
        cleanContent.length > 80
          ? `${cleanContent.slice(0, 77)}...`
          : cleanContent;
      const notification = await Notification.create({
        message: `Nouveau message client: ${short}`,
        type: "message",
        userId: req.user.id,
      });
      console.log("[Notification] Message créé:", notification.message);
    } catch (notifError) {
      console.error("Erreur création notification message:", notifError);
      // Ne pas bloquer la réponse si la notification échoue
    }

    const populated = await message.populate("user", "name email");

    res.status(201).json({ message: populated });
  } catch (err) {
    next(err);
  }
};

// Admin → list all messages
exports.list = async (req, res, next) => {
  try {
    const messages = await AdminMessage.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// Admin → mark one message as read
exports.markRead = async (req, res, next) => {
  try {
    const msg = await AdminMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    ).populate("user", "name email");

    if (!msg) {
      return res.status(404).json({ message: "Message introuvable." });
    }

    res.json({ message: msg });
  } catch (err) {
    next(err);
  }
};

// Admin → delete message
exports.remove = async (req, res, next) => {
  try {
    const msg = await AdminMessage.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: "Message introuvable." });
    }
    res.json({ message: "Message supprimé." });
  } catch (err) {
    next(err);
  }
};

