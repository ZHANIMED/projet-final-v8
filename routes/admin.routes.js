const router = require("express").Router();
const productCtrl = require("../controllers/product.controller");
const adminCtrl = require("../controllers/admin.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

// router.get("/health", (req, res) => res.json({ status: "admin routes OK" }));

// Modération des avis
router.get("/reviews", productCtrl.getAllReviews);

// Toutes les routes ici nécessitent d'être admin
// router.use(isAuth, isAdmin);

const newsletterCtrl = require("../controllers/newsletter.controller");

router.get("/stats/dashboard", isAuth, isAdmin, adminCtrl.getDashboardStats);
router.get("/newsletter/subscribers", isAuth, isAdmin, newsletterCtrl.getSubscribers);

router.put("/reviews/:productId/:reviewId/moderate", isAuth, isAdmin, productCtrl.moderateReview);

router.get("/health", (req, res) => res.json({ status: "admin routes OK" }));

module.exports = router;
