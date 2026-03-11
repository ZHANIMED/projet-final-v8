const express = require("express");
const router = express.Namespace ? express.Router() : express.Router();
const settingsCtrl = require("../controllers/settings.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const uploadProduct = require("../middlewares/uploadProduct"); // ✅ Reusing Cloudinary upload logic

router.get("/", settingsCtrl.getSettings);
router.put(
    "/",
    isAuth,
    isAdmin,
    uploadProduct.fields([
        { name: "siteLogo", maxCount: 1 },
        { name: "heroImage", maxCount: 1 }
    ]),
    settingsCtrl.updateSettings
);

module.exports = router;
