const express = require("express");
const { spin ,looping} = require("../controllers/rooster.controller");

const router = express.Router();

router.post("/rooster_spin", spin);
router.post("/rooster_looping", looping);


module.exports = router;
