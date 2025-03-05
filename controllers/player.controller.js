const Player = require("../models/player");
const RoosterPlayer = require("../models/roosterPlayer")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "your_secret_key"; 

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let player = await Player.findOne({ email });
    if (player) return res.status(400).json({ msg: "Email already exists" });

    player = new Player({ username, email, password });
    await player.save();

    res.status(201).json({ msg: "Registration successful", playerId: player._id });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const player = await Player.findOne({ email });
    if (!player) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await player.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ playerId: player._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ msg: "Login successful", token, playerId: player._id, coins: player.coins, freeSpins: player.freeSpins });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const player = await Player.findById(req.playerId).select("-password");
    if (!player) return res.status(404).json({ msg: "Player not found" });

    res.json(player);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};




const registerRoster = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let player = await RoosterPlayer.findOne({ email });
    if (player) return res.status(400).json({ msg: "Email already exists" });

    player = new RoosterPlayer({ username, email, password });
    await player.save();

    res.status(201).json({ msg: "Registration successful", playerId: player._id });
  } catch (err) {
    console.log(err, "err");

    res.status(500).json({ msg: "Server error" });
  }
};

const loginRoster = async (req, res) => {
  try {
    const { email, password } = req.body;

    const player = await RoosterPlayer.findOne({ email });
    if (!player) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await player.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ playerId: player._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ msg: "Login successful", token, playerId: player._id, coins: player.coins, freeSpins: player.freeSpins });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

const getProfileRoster = async (req, res) => {
  try {
    const player = await RoosterPlayer.findById(req.playerId).select("-password");
    if (!player) return res.status(404).json({ msg: "Player not found" });

    res.json(player);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { register, login, getProfile, registerRoster, loginRoster, getProfileRoster };
