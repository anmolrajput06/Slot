const express = require("express");
const { spin, freeSpin } = require("../controllers/game.controller");
// const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// router.post("/spin", authMiddleware, spin);
// router.post("/free-spin", authMiddleware, freeSpin);
router.post("/spin", spin);
router.post("/free-spin", freeSpin);

module.exports = router;
