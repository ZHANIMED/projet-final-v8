const router = require("express").Router();
const ctrl = require("../controllers/page.controller");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

router.get("/", ctrl.getAll);
router.get("/:slug", ctrl.getOne);

router.post("/", isAuth, isAdmin, ctrl.create);
router.put("/:id", isAuth, isAdmin, ctrl.update);
router.delete("/:id", isAuth, isAdmin, ctrl.remove);

module.exports = router;
