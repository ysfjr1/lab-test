const { Router } = require("express");
const ctrl = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

router.get("/", ctrl.getAll);
router.post("/", authenticate, authorize("admin"), ctrl.create);
router.put("/:id", authenticate, authorize("admin"), ctrl.update);
router.delete("/:id", authenticate, authorize("admin"), ctrl.remove);

module.exports = router;
