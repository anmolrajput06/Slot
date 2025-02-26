const express = require("express");
const { spin } = require("../controllers/game.controller");
// const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// router.post("/spin", authMiddleware, spin);
// router.post("/free-spin", authMiddleware, freeSpin);
router.post("/spin", spin);

module.exports = router;
