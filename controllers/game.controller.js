
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
      1: ["0", "1", "2", "3", "10", "0", "1", "10", "3", "10", "2", "10", "0", "5", "10", "1", "0", "3", "2", "10", "1", "0", "10", "2", "3", "10"],
      2: ["0", "1", "2", "3", "10", "2", "3", "10", "1", "10", "4", "10", "5", "6", "10", "2", "0", "3", "1", "10", "0", "10", "3", "2", "10", "1"],
      3: ["0", "1", "2", "3", "10", "3", "1", "10", "2", "10", "4", "10", "5", "10", "6", "10", "3", "0", "1", "2", "10", "0", "10", "2", "3", "1"],
      4: ["0", "1", "2", "3", "10", "1", "2", "10", "3", "10", "4", "10", "5", "10", "6", "10", "1", "0", "3", "2", "10", "0", "10", "3", "1", "2"],
      5: ["0", "1", "2", "3", "10", "3", "2", "10", "1", "10", "4", "10", "5", "10", "6", "10", "2", "0", "1", "3", "10", "0", "10", "2", "3", "1"]
    };


    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ msg: "Player not found" });

    if (player && player.isfreespin == false) {

      if (player.coins < betAmount) {
        return res.status(400).json({ msg: "Not enough coins" });
      }

      let reels = [
        await generateRandomReels(reelStrip[1]),
        await generateRandomReels(reelStrip[2]),
        await generateRandomReels(reelStrip[3]),
        await generateRandomReels(reelStrip[4]),
        await generateRandomReels(reelStrip[5])
      ];

      // let reels = [
      //   ['4', '1', '1', '1'],
      //   ['10', '11', '11', '11'],
      //   ['5', '1', '11', '10'],
      //   ['1', '3', '2', '13'],
      //   ['12', '1', '3', '5']
      // ]

      if (!isValidReelState(reels)) {
        return res.status(500).json({ msg: "Malfunction detected. Spin voided." });
      }
      const { totalWin, winningLines } = checkPaylineWin(reels, betAmount);

      let totalBet = betAmount
      let RTP = (totalWin / totalBet) * 100;
      let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
      let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);

      function calculateFreeSpins(reels) {
        let symbolsToCheck = ["11", "12"];
        let accumulatedCount = 0;
        let totalFreeSpins = 0;
        let foundFirstSymbol = false;

        for (let i = 0; i < reels.length; i++) {
          let currentCount = reels[i].filter(symbol => symbolsToCheck.includes(symbol)).length;

          if (i === 0 && currentCount > 0) {
            foundFirstSymbol = true;
          }

          if (i > 0 && !foundFirstSymbol) {
            return 0;
          }

          if (currentCount === 0) {
            break;
          }

          accumulatedCount += currentCount;

          if (accumulatedCount >= 5) {
            let extraSymbols = accumulatedCount - 5;
            totalFreeSpins = 5 + extraSymbols * 5;
          }
        }

        return totalFreeSpins;
      }
      // console.log(calculateFreeSpins(reels), "==============================");

      const freeSpinsWon = calculateFreeSpins(reels)

      // const freeSpinsWon = 0

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

        // totalWin: parseFloat(adjustedWin),
        freeSpinsWon,
        totalWin,
        winningLines,
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

        const reelStrip = {
          1: ["0", "1", "2", "3", "10", "0", "1", "10", "3", "10", "2", "10", "0", "5", "10", "1", "0", "3", "2", "10", "1", "0", "10", "2", "3", "10"],
          2: ["0", "1", "2", "3", "10", "2", "3", "10", "1", "10", "4", "10", "5", "6", "10", "2", "0", "3", "1", "10", "0", "10", "3", "2", "10", "1"],
          3: ["0", "1", "2", "3", "10", "3", "1", "10", "2", "10", "4", "10", "5", "10", "6", "10", "3", "0", "1", "2", "10", "0", "10", "2", "3", "1"],
          4: ["0", "1", "2", "3", "10", "1", "2", "10", "3", "10", "4", "10", "5", "10", "6", "10", "1", "0", "3", "2", "10", "0", "10", "3", "1", "2"],
          5: ["0", "1", "2", "3", "10", "3", "2", "10", "1", "10", "4", "10", "5", "10", "6", "10", "2", "0", "1", "3", "10", "0", "10", "2", "3", "1"]
        };
        let reels

        if (lockedSpin.spins.length == 0) {
          reels =
            [
              await generateRandomReels(reelStrip[1]),
              await generateRandomReels(reelStrip[2]),
              await generateRandomReels(reelStrip[3]),
              await generateRandomReels(reelStrip[4]),
              await generateRandomReels(reelStrip[5])
            ];
        } else {
          const previousReels = lockedSpin.spins[lockedSpin.spins.length - 1];

          reels = previousReels.map((col) => {
            if (col.some(symbol => symbol == "13" || symbol == "14")) {
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
  const validSymbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
  return reels.flat().every(symbol => validSymbols.includes(symbol));
};

const looping = async (req, res) => {
  try {
    let totalWinSum = 0;
    let totalBetAmount = 0;
    let totalFreeSpins = 0;
    let totalWins = 0; // Count of total wins
    let results = [];

    for (let i = 0; i < 100000; i++) {
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

