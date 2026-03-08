const Notification = require("../models/Notification");

exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find()
            .populate("userId", "name email photo")
            .sort({ createdAt: -1 })
            .limit(50);
        
        // Log pour debug (à retirer en production si nécessaire)
        console.log(`[Notifications] Récupération de ${notifications.length} notifications`);
        
        res.json({ notifications });
    } catch (err) {
        next(err);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification introuvable" });
        }
        res.json({ notification });
    } catch (err) {
        next(err);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ read: false }, { read: true });
        res.json({ message: "Toutes les notifications sont lues" });
    } catch (err) {
        next(err);
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: "Notification supprimée" });
    } catch (err) {
        next(err);
    }
};
