const express = require("express");
const { register, login, getProfile,registerRoster,loginRoster ,getProfileRoster} = require("../controllers/player.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);



router.post("/rooster_register", registerRoster);
router.post("/login", loginRoster);
router.get("/profile", authMiddleware, getProfileRoster);

module.exports = router;
