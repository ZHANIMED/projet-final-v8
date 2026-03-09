const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const upload = require("../middlewares/upload"); // Assuming you have an upload middleware

router.post("/chat", aiController.chat);
router.post("/describe-image", upload.single("image"), aiController.describeImage);

module.exports = router;
