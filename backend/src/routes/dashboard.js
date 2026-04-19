const { Router } = require("express");
const { getStats } = require("../controllers/dashboardController");
const { authenticate } = require("../middlewares/auth");

const router = Router();

router.get("/stats", authenticate, getStats);

module.exports = router;
