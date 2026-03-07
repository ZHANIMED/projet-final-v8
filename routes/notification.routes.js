const router = require("express").Router();
const notificationController = require("../controllers/notification.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

router.get("/", isAuth, isAdmin, notificationController.getNotifications);
router.patch("/mark-all-read", isAuth, isAdmin, notificationController.markAllAsRead);
router.patch("/:id/read", isAuth, isAdmin, notificationController.markAsRead);
router.delete("/:id", isAuth, isAdmin, notificationController.deleteNotification);

module.exports = router;
