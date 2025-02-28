const express = require("express");
const { spin } = require("../controllers/rooster.controller");

const router = express.Router();

router.post("/rooster_spin", spin);

module.exports = router;
