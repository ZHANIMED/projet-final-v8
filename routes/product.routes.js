const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const uploadProduct = require("../middlewares/uploadProduct");

router.get("/", ctrl.getAll);
router.get("/:slug", ctrl.getOne);

router.post("/", isAuth, isAdmin, uploadProduct.single("image"), ctrl.create);
router.put("/:id", isAuth, isAdmin, uploadProduct.single("image"), ctrl.update);
router.delete("/:id", isAuth, isAdmin, ctrl.remove);

// Avis produit
router.post("/:slug/reviews", isAuth, ctrl.addReview);

module.exports = router;