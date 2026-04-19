const { Router } = require("express");
const ctrl = require("../controllers/articleController");
const { authenticate } = require("../middlewares/auth");

const router = Router();

router.get("/", ctrl.getAll);
router.get("/admin", authenticate, ctrl.getAllAdmin);
router.get("/slug/:slug", ctrl.getBySlug);
router.get("/:id/related", ctrl.getRelated);
router.get("/:id", authenticate, ctrl.getById);
router.post("/", authenticate, ctrl.create);
router.put("/:id", authenticate, ctrl.update);
router.delete("/:id", authenticate, ctrl.remove);

module.exports = router;
