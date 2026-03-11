const express = require("express");
const router = express.Router();
const couponCtrl = require("../controllers/coupon.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const maybeAuth = require("../middlewares/maybeAuth");

router.get("/active", couponCtrl.getActive);
router.get("/", isAuth, isAdmin, couponCtrl.getAll);
router.post("/", isAuth, isAdmin, couponCtrl.create);
router.delete("/:id", isAuth, isAdmin, couponCtrl.remove);
router.post("/validate", maybeAuth, couponCtrl.validate);

module.exports = router;
