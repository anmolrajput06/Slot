
const Player = require("../models/player");
const SlotGame = require("../models/game");
const { checkPaylineWin } = require("../helper/calculateWin");
const paylines = require("../helper/paylines");

const spin = async (req, res) => {
  const { playerId, betAmount } = req.body;
  const MAX_WIN_LIMIT = 250000;
  const RTP_PERCENTAGE = 100;

  try {

console.log("inter");



    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ msg: "Player not found" });

    if (player.coins < betAmount) {
      return res.status(400).json({ msg: "Not enough coins" });
    }

    const symbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];

    let reels = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)])
    );

    if (!isValidReelState(reels)) {
      return res.status(500).json({ msg: "Malfunction detected. Spin voided." });
    }

    const { totalWin, winningLines } = checkPaylineWin(reels, betAmount);
    let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
    let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);
    const reelsWith11 = reels.filter(reel => reel.some(symbol => symbol.includes("11"))).length;
    const reelsWith12 = reels.filter(reel => reel.some(symbol => symbol.includes("12"))).length;

    const featureCount = reelsWith11 === 5 ? 5 : (reelsWith12 === 5 ? 5 : 0);

    // const featureCount = reels.flat().filter(symbol => symbol.includes("11")).length ? reels.flat().filter(symbol => symbol.includes("11")).length : reels.flat().filter(symbol => symbol.includes("12")).length;

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

    // await gameData.save();

    res.json({
      msg: "Spin complete",
      reels,
      // totalWin: parseFloat(adjustedWin),
      totalWin,
      winningLines,
      freeSpinsWon,
      // randomeReels: generateRandomReels()
    });
  } catch (err) {
    console.error("Malfunction detected:", err);
    res.status(500).json({ msg: "Malfunction voids all pays and plays." });
  }
};



const isValidReelState = (reels) => {
  const validSymbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
  return reels.flat().every(symbol => validSymbols.includes(symbol));
};


const generateRandomReels = () => {
  const reelStrip = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
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
// const reelStrips = {
//   1: ["1", "5", "3", "8", "4", "2", "10", "7", "6", "9", "12", "11", "13", "2", "8", "6", "3", "5"],
//   2: ["2", "9", "7", "3", "5", "8", "6", "4", "10", "1", "12", "13", "11", "3", "7", "5", "8"],
//   3: ["10", "6", "3", "8", "5", "7", "4", "1", "2", "12", "11", "9", "13", "2", "5", "7", "8"],
//   4: ["5", "4", "7", "6", "10", "8", "3", "2", "9", "12", "1", "13", "11", "6", "5", "3", "8"],
//   5: ["3", "7", "4", "10", "8", "5", "2", "1", "6", "9", "12", "13", "11", "7", "3", "8", "5"]
// };


// const generateRandomReels = () => {
//   let reels = [];

//   for (let i = 1; i <= 5; i++) {
//     let strip = reelStrips[i];
//     let randomIndex = Math.floor(Math.random() * strip.length);

//     let reel = [
//       strip[randomIndex % strip.length],
//       strip[(randomIndex + 1) % strip.length],
//       strip[(randomIndex + 2) % strip.length],
//       strip[(randomIndex + 3) % strip.length]
//     ];

//     reels.push(reel);
//   }

//   return reels;
// };



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

