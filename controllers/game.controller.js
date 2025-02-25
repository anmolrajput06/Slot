
const Player = require("../models/player");
const SlotGame = require("../models/game");
const { checkPaylineWin } = require("../helper/calculateWin");
const paylines = require("../helper/paylines");

const spin = async (req, res) => {
  const { playerId, betAmount } = req.body;
  const MAX_WIN_LIMIT = 250000;
  const RTP_PERCENTAGE = 100;

  try {




    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ msg: "Player not found" });

    if (player.coins < betAmount) {
      return res.status(400).json({ msg: "Not enough coins" });
    }

    const symbols = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

    let reels = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)])
    );

    if (!isValidReelState(reels)) {
      return res.status(500).json({ msg: "Malfunction detected. Spin voided." });
    }

    const { totalWin, winningLines } = checkPaylineWin(reels, betAmount);
    let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
    let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);

    const featureCount = reels.flat().filter(symbol => symbol.includes("7")).length;
    const freeSpinsWon = featureCount >= 5 ? Math.min(5 + (featureCount - 5) * 5, 80) : 0;

    player.coins = player.coins - betAmount + parseFloat(adjustedWin);
    player.freeSpins += freeSpinsWon;
    await player.save();

    const gameData = new SlotGame({
      playerId,
      reels,
      freeSpins: freeSpinsWon,
      totalWin: parseFloat(adjustedWin),
      winningLines,
      status: "Completed",
    });

    await gameData.save();

    res.json({
      msg: "Spin complete",
      reels,
      // totalWin: parseFloat(adjustedWin),
      totalWin,
      winningLines,
      freeSpinsWon,
      randomeReels: generateRandomReels()
    });
  } catch (err) {
    console.error("Malfunction detected:", err);
    res.status(500).json({ msg: "Malfunction voids all pays and plays." });
  }
};

const isValidReelState = (reels) => {
  const validSymbols = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  return reels.flat().every(symbol => validSymbols.includes(symbol));
};


const generateRandomReels = () => {
  const reelStrip = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
  let reels = [];

  for (let i = 0; i < 5; i++) {
    let randomIndex = Math.floor(Math.random() * reelStrip.length);
    let reel = [
      reelStrip[randomIndex % reelStrip.length],
      reelStrip[(randomIndex + 1) % reelStrip.length],
      reelStrip[(randomIndex + 2) % reelStrip.length],
      reelStrip[(randomIndex + 3) % reelStrip.length]

    ];
    reels.push(reel);
  }

  return reels;
};

console.log(generateRandomReels());


const freeSpin = async (req, res) => {
  const { playerId } = req.body;

  try {
    let player = await Player.findById(playerId);
    if (!player || player.freeSpins <= 0) return res.status(400).json({ msg: "No free spins available" });

    player.freeSpins -= 1;
    await player.save();

    return res.json({ msg: "Free spin used", remainingFreeSpins: player.freeSpins });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { spin, freeSpin };

