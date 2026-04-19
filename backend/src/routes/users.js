const { Router } = require("express");
const { getAll, remove } = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", getAll);
router.delete("/:id", remove);

module.exports = router;
