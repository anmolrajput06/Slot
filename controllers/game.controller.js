
const Player = require("../models/player");
const SlotGame = require("../models/game");
const { checkPaylineWin } = require("../helper/calculateWin");
const paylines = require("../helper/paylines");
let lockedSpin = { spins: [] };
const spin = async (req, res) => {
  const { playerId, betAmount } = req.body;
  const MAX_WIN_LIMIT = 250000;
  const RTP_PERCENTAGE = 100;

  try {
    const reelStrip = {
      1: ["4", "5", "6", "0", "5", "0", "11", "8", "7", "9", "10", "1", "5", "6", "12", "13", "14", "15", "1", "2", "11", "4", "5", "3", "11"],
      2: ["6", "5", "4", "6", "1", "4", "11", "8", "7", "9", "10", "4", "5", "6", "12", "13", "14", "15", "1", "2", "6", "5", "0", "3", "4"],
      3: ["1", "4", "6", "5", "4", "6", "11", "8", "7", "9", "10", "4", "5", "6", "12", "13", "14", "15", "1", "2", "1", "6", "0", "3", "11"],
      4: ["4", "6", "5", "4", "6", "5", "11", "8", "7", "9", "10", "4", "5", "6", "12", "13", "14", "15", "1", "2", "4", "6", "0", "3", "11"],
      5: ["6", "4", "5", "6", "4", "5", "11", "8", "7", "9", "10", "1", "5", "6", "12", "13", "14", "15", "1", "2", "11", "5", "0", "3", "11", "4"]
    };

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ msg: "Player not found" });

    if (player && player.isfreespin == false) {

      if (player.coins < betAmount) {
        return res.status(400).json({ msg: "Not enough coins" });
      }
      // let reels = Array.from({ length: 5 }, () =>
      //   Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)])
      // );
      let reels = [
        await generateRandomReels(reelStrip[1]),
        await generateRandomReels(reelStrip[2]),
        await generateRandomReels(reelStrip[3]),
        await generateRandomReels(reelStrip[4]),
        await generateRandomReels(reelStrip[5])
      ];


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
      let totalBet = betAmount

      let RTP = (totalWin / totalBet) * 100;


      let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
      let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);
      const reelsWith13 = reels.filter(reel => reel.some(symbol => symbol.includes("13"))).length;
      const reelsWith12 = reels.filter(reel => reel.some(symbol => symbol.includes("12"))).length;
      const featureCount = (reelsWith13 == 5 || reelsWith12 == 5) ? 5 : 0;
      const freeSpinsWon = featureCount >= 5 ? Math.min(5 + (featureCount - 5) * 5, 80) : 0;

      player.coins = player.coins - betAmount + totalWin
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
        // totalWin: parseFloat(adjustedWin),
        totalWin,
        winningLines,
        freeSpinsWon,
        RTP,
        reels,
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

        const generateRandomReel = () => {
          return Array.from({ length: 5 }, () =>
            Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)])
          );
        };
        // let reels = [
        //   ['14', '13', '2', '11'],
        //   ['10', '12', '13', '15'],
        //   ['5', '13', '6', '10'],
        //   ['12', '3', '2', '13'],
        //   ['13', '1', '3', '5']
        // ]


        let reels;

        if (lockedSpin.spins.length === 0) {
          reels = generateRandomReel();
        } else {
          const previousReels = lockedSpin.spins[lockedSpin.spins.length - 1];

          reels = previousReels.map((col) => {
            if (col.some(symbol => symbol === "14" || symbol === "15")) {
              return col;
            } else {
              return Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
            }
          });
        }

        // lockedSpin.spins.push(reels);
        lockedSpin.spins = [reels];

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
          // totalWin: parseFloat(adjustedWin),
          totalWin,
          winningLines,
          freeSpinsWon: 0,
          reels,
          // randomeReels: generateRandomReels()
        });


      } catch (err) {
        console.log(err);

        return res.status(500).json({ msg: "Server error", err });
      }
    }


  } catch (err) {
    console.error("Malfunction detected:", err);
    res.status(500).json({ msg: "Malfunction voids all pays and plays." });
  }
};
const generateRandomReels = (reelStrip) => {
  let randomInt = Math.floor(Math.random() * (reelStrip.length));
  let resultReel = [];
  resultReel.push(reelStrip[(randomInt + 0) % reelStrip.length]);
  resultReel.push(reelStrip[(randomInt + 1) % reelStrip.length]);
  resultReel.push(reelStrip[(randomInt + 2) % reelStrip.length]);
  resultReel.push(reelStrip[(randomInt + 3) % reelStrip.length]);
  return resultReel;
};

const isValidReelState = (reels) => {
  const validSymbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  return reels.flat().every(symbol => validSymbols.includes(symbol));
};

const looping = async (req, res) => {
  try {
    let totalWinSum = 0;
    let totalBetAmount = 0;
    let totalFreeSpins = 0;
    let totalWins = 0; // Count of total wins
    let results = [];

    for (let i = 0; i < 1000; i++) {
      const Req = { body: req.body };
      const Res = {
        json: (data) => {
          if (data.totalWin !== undefined) {
            totalWinSum += data.totalWin;
            if (data.totalWin > 0) {
              totalWins++; // Increment only if there is a win
            }
          }
          if (!data.freeSpinActive && req.body.betAmount) {
            totalBetAmount += Number(req.body.betAmount);
          }
          if (data.freeSpinsWon !== undefined) {
            totalFreeSpins += data.freeSpinsWon;
          }
          results.push(data);
        },
        status: () => Res,
      };

      console.log(i, "=>", "RTP", (totalWinSum / totalBetAmount) * 100, "totalWins count => ", totalWins, "total win= ", totalWinSum, "total bet = ", totalBetAmount);
      await spin(Req, Res);
    }

    totalBetAmount -= totalFreeSpins * Number(req.body.betAmount);
    let RTP = (totalWinSum / totalBetAmount) * 100;

    res.json({
      message: "1000 spins complete",
      totalWin: totalWinSum,
      totalBet: totalBetAmount < 0 ? 0 : totalBetAmount,
      totalRTP: RTP,
      totalFreeSpins: totalFreeSpins,
      // totalWinsCount: totalWins, // Add total winning count
      // sampleResults: results,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in looping", error });
  }
};



module.exports = { spin, looping };

