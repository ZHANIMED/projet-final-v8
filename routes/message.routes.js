const router = require("express").Router();
const ctrl = require("../controllers/message.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

// User: create a private message to admin
router.post("/", isAuth, ctrl.create);

// Admin: list / mark read / delete
router.get("/", isAuth, isAdmin, ctrl.list);
router.patch("/:id/read", isAuth, isAdmin, ctrl.markRead);
router.delete("/:id", isAuth, isAdmin, ctrl.remove);

module.exports = router;

