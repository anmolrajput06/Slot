
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

    if (player && player.isfreespin == false) {

      if (player.coins < betAmount) {
        return res.status(400).json({ msg: "Not enough coins" });
      }

      const symbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

      let reels = Array.from({ length: 5 }, () =>
        Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)])
      );

      // let reels = [
      //   ['14', '13', '2', '11'],
      //   ['10', '12', '13', '15'],
      //   ['5', '13', '6', '10'],
      //   ['12', '3', '2', '13'],
      //   ['13', '1', '3', '5']
      // ]
      if (!isValidReelState(reels)) {
        return res.status(500).json({ msg: "Malfunction detected. Spin voided." });
      }

      const { totalWin, winningLines } = checkPaylineWin(reels, betAmount);
      let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
      let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);
      const reelsWith13 = reels.filter(reel => reel.some(symbol => symbol.includes("13"))).length;
      const reelsWith12 = reels.filter(reel => reel.some(symbol => symbol.includes("12"))).length;
      const featureCount = (reelsWith13 == 5 || reelsWith12 == 5) ? 5 : 0;
      const freeSpinsWon = featureCount >= 5 ? Math.min(5 + (featureCount - 5) * 5, 80) : 0;

      player.coins = player.coins - betAmount + parseFloat(adjustedWin);
      player.freeSpins += freeSpinsWon;
      if (freeSpinsWon != 0) {
        player.isfreespin = true

      }
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
    } else {
      try {

        player.freeSpins = Math.max(0, player.freeSpins - 1);
        if (player.freeSpins == 0) {
          player.isfreespin = false;
        }
        await player.save();

        const symbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "14", "15"];

        let reels = Array.from({ length: 5 }, () =>
          Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)])
        );
        // let reels = [
        //   ['14', '13', '2', '11'],
        //   ['10', '12', '13', '15'],
        //   ['5', '13', '6', '10'],
        //   ['12', '3', '2', '13'],
        //   ['13', '1', '3', '5']
        // ]

        const { totalWin, winningLines } = checkPaylineWin(reels, 0);
        let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
        let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);

        player.coins = player.coins - 0 + parseFloat(adjustedWin);
        await player.save();
        const gameData = new SlotGame({
          playerId,
          reels,
          freeSpins: 0,
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
          freeSpinsWon: 0,
          // randomeReels: generateRandomReels()
        });


      } catch (err) {
        return res.status(500).json({ msg: "Server error" });
      }
    }


  } catch (err) {
    console.error("Malfunction detected:", err);
    res.status(500).json({ msg: "Malfunction voids all pays and plays." });
  }
};



const isValidReelState = (reels) => {
  const validSymbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  return reels.flat().every(symbol => validSymbols.includes(symbol));
};



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

