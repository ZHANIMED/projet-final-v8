const router = require("express").Router();
const newsletterCtrl = require("../controllers/newsletter.controller");

router.post("/subscribe", newsletterCtrl.subscribe);

module.exports = router;
