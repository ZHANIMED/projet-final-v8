const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const uploadProduct = require("../middlewares/uploadProduct");

const multer = require("multer");

const storage = multer.memoryStorage();
const uploadCsv = multer({ storage });

router.get("/", ctrl.getAll);
router.get("/:slug", ctrl.getOne);

router.post("/bulk-import", isAuth, isAdmin, uploadCsv.single("file"), ctrl.bulkImport);

router.post("/", isAuth, isAdmin, uploadProduct.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), ctrl.create);
router.put("/:id", isAuth, isAdmin, uploadProduct.fields([{ name: "image", maxCount: 1 }, { name: "images", maxCount: 10 }]), ctrl.update);
router.delete("/:id", isAuth, isAdmin, ctrl.remove);

// Avis produit
router.post("/:slug/reviews", isAuth, ctrl.addReview);

module.exports = router;