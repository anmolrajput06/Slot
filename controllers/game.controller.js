
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
      1: [0, 1, 2, 3, 10, 0, 1, 10, 3, 10, 2, 10, 0, 5, 10, 1, 0, 3, 2, 10, 11, 12, 10, 10, 1, 0, 10, 2, 3, 10],
      2: [0, 1, 2, 3, 10, 2, 3, 10, 1, 10, 4, 10, 5, 6, 10, 2, 0, 3, 1, 10, 11, 12, 10, 10, 0, 10, 3, 2, 10, 1],
      3: [0, 1, 2, 3, 10, 3, 1, 10, 2, 10, 4, 10, 5, 10, 6, 10, 3, 0, 1, 2, 11, 12, 10, 10, 10, 0, 10, 2, 3, 1],
      4: [0, 1, 2, 3, 10, 1, 2, 10, 3, 10, 4, 10, 5, 10, 6, 10, 1, 0, 3, 2, 11, 12, 10, 10, 10, 0, 10, 3, 1, 2],
      5: [0, 1, 2, 3, 10, 3, 2, 10, 1, 10, 4, 10, 5, 10, 6, 10, 2, 0, 1, 3, 11, 12, 10, 10, 10, 0, 10, 2, 3, 1]
    };

    let response = {};

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ msg: "Player not found" });

    if (player && player.isfreespin == false) {
      let freeSpinActive = false

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
      //   [4, 11, 12, 1],
      //   [12, 11, 11, 11],
      //   [5, 2, 1, 10],
      //   [11, 3, 1, 13],
      //   [12, 1, 3, 5]
      // ]

      // let reels = [
      //   [12, 12, 12, 12],
      //   [12, 12, 12, 12],
      //   [12, 12, 12, 12],
      //   [12, 12, 12, 12],
      //   [12, 12, 12, 12]
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
        let symbolsToCheck = [11, 12];
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


      player.coins = player.coins - betAmount + totalWin
      player.freeSpins += freeSpinsWon;
      if (freeSpinsWon != 0) {
        player.isfreespin = true
        freeSpinActive = true
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

      // if (freeSpinsWon != 0) {
      lockedSpin.spins = [reels];
      // }
      let steckyReels = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]

      response = {
        bet: betAmount,
        win: totalWin,
        freeSpinWin: freeSpinsWon,
        reels: await convertReel(reels),
        winData: winningLines,
        freeSpinActive,
        steckyReel: await convertReel(steckyReels),
      };


      res.json({

        // freeSpinWin: freeSpinsWon,
        // totalWin,
        // reels,
        // winData: winningLines,
        // steckyReel,
        statusCode: 1,
        message: "Success",
        result: response
      });

    } else {



      try {
        const reelStrip = {
          1: [0, 1, 2, 3, 10, 0, 1, 10, 3, 10, 2, 10, 0, 5, 10, 1, 0, 3, 2, 10, 11, 12, 10, 10, 1, 0, 10, 2, 3, 10],
          2: [0, 1, 2, 3, 10, 2, 3, 10, 1, 10, 4, 10, 5, 6, 10, 2, 0, 3, 1, 10, 11, 12, 10, 10, 0, 10, 3, 2, 10, 1],
          3: [0, 1, 2, 3, 10, 3, 1, 10, 2, 10, 4, 10, 5, 10, 6, 10, 3, 0, 1, 2, 11, 12, 10, 10, 10, 0, 10, 2, 3, 1],
          4: [0, 1, 2, 3, 10, 1, 2, 10, 3, 10, 4, 10, 5, 10, 6, 10, 1, 0, 3, 2, 11, 12, 10, 10, 10, 0, 10, 3, 1, 2],
          5: [0, 1, 2, 3, 10, 3, 2, 10, 1, 10, 4, 10, 5, 10, 6, 10, 2, 0, 1, 3, 11, 12, 10, 10, 10, 0, 10, 2, 3, 1]
        };
        let response = {};

        if (!reelStrip || Object.keys(reelStrip).length < 5) {
          throw new Error("reelStrip is not properly initialized!");
        }
        let reels

        if (lockedSpin.spins.length === 0) {
          let freeSpinActive = true
          player.freeSpins = Math.max(0, player.freeSpins - 1);
          if (player.freeSpins == 0) {
            player.isfreespin = false;
            freeSpinActive = false
          }
          let steckyReels = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]


          reels = [
            generateRandomReels(reelStrip[1]),
            generateRandomReels(reelStrip[2]),
            generateRandomReels(reelStrip[3]),
            generateRandomReels(reelStrip[4]),
            generateRandomReels(reelStrip[5])
          ];

          lockedSpin.spins = [reels];

          const { totalWin, winningLines } = checkPaylineWin(reels, 0);
          let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
          let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);

          response = {
            bet: 0,
            win: totalWin,
            freeSpinWin: 0,
            freeSpinActive,
            reels: await convertReel(reels),
            winData: winningLines,
            steckyReel: await convertReel(steckyReels),
          };

          console.log(response, "response");

          res.json({
            // msg: "Free Spin complete",
            // freeSpinWin: 0,
            // totalWin,
            // reels,
            // winData: winningLines,
            // steckyReel


            statusCode: 0,
            message: " Free Spin Success",
            result: response
          });
        }
        else {
          let freeSpinActive = true
          player.freeSpins = Math.max(0, player.freeSpins - 1);
          if (player.freeSpins == 0) {
            player.isfreespin = false;
            freeSpinActive = false
          }
          await player.save();
          let previousReels = lockedSpin.spins.length > 0 ? lockedSpin.spins[lockedSpin.spins.length - 1] : [];

          while (Array.isArray(previousReels) && previousReels.length === 1) {
            previousReels = previousReels[0];
          }

          reels = [];
          let continueProcess = true;

          if (!lockedSpin.steckyReel) {
            lockedSpin.steckyReel = [
              [0, 0, 0, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0]
            ];
          }

          let steckyReel = lockedSpin.steckyReel;

          for (let colIndex = 1; colIndex <= 5; colIndex++) {
            if (!Array.isArray(reelStrip[colIndex])) {
              reelStrip[colIndex] = [0, 1, 2, 3, 4];
            }

            let newReel = [];
            let randomReel = generateRandomReels(reelStrip[colIndex]);
            // let randomReel = [
            //   [11, 12, 12, 12],
            //   [12, 11, 12, 12],
            //   [12, 12, 12, 12],
            //   [11, 11, 12, 11],
            //   [12, 12, 12, 12]
            // ]
            let has11or12 = previousReels[colIndex - 1]?.some(symbol => symbol == 11 || symbol == 12) ?? false;

            if (!has11or12) {
              continueProcess = false;
            }

            for (let rowIndex = 0; rowIndex < (previousReels[colIndex - 1]?.length || 0); rowIndex++) {
              let symbol = previousReels[colIndex - 1]?.[rowIndex] ?? 0;

              let randomSymbol;
              do {
                randomSymbol = Math.floor(Math.random() * 13) + 1;
              } while (randomSymbol == 14);

              if (continueProcess) {
                if (symbol === 12 && steckyReel[colIndex - 1][rowIndex] !== 1) {
                  steckyReel[colIndex - 1][rowIndex] = 1;
                }
              }

              newReel.push(randomReel[rowIndex] ?? randomSymbol);
            }

            reels.push(newReel);
          }

          if (reels.length !== 5 || reels.some(col => col.length !== 4)) {
            throw new Error("Reels array is malformed!");
          }

          for (let colIndex = 0; colIndex < 5; colIndex++) {
            for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
              if (steckyReel[colIndex][rowIndex] == 1 && reels[colIndex][rowIndex] == 11) {
                reels[colIndex][rowIndex] = 13;
              }
            }
          }

          lockedSpin.spins = [reels];

          const { totalWin, winningLines } = checkPaylineWin(reels, 0);
          let finalWin = Math.min(totalWin, MAX_WIN_LIMIT);
          let adjustedWin = (finalWin * (RTP_PERCENTAGE / 100)).toFixed(2);

          response = {
            bet: 0,
            freeSpinActive,
            win: totalWin,
            freeSpinWin: 0,
            reels: await convertReel(reels),
            winData: winningLines,
            steckyReel: await convertReel(steckyReel),
          };

          res.json({
            statusCode: 0,
            message: "Free Spin Success",
            result: response
          });
        }


      } catch (err) {
        console.error("Malfunction detected:", err);
        res.status(500).json({ msg: "Malfunction voids all pays and plays." });
      }
    }


  } catch (err) {
    console.error("Malfunction detected:", err);
    res.status(500).json({ msg: "Malfunction voids all pays and plays." });
  }
};


// check 11 in this code


// const generateRandomReels = (reelStrip) => {
//   let randomInt = Math.floor(Math.random() * (reelStrip.length));
//   let resultReel = [];

//   // Ensure 4 positions are set to 11
//   let indices = [0, 1, 2, 3]; // The positions in the reel
//   indices.forEach(() => resultReel.push(11));

//   return resultReel;
// };

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
  const validSymbols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  return reels.flat().every(symbol => validSymbols.includes(symbol));
};

let counttrue = 0
const looping = async (req, res) => {
  try {
    let totalWinSum = 0;
    let totalBetAmount = 0;
    let totalFreeSpins = 0;
    let totalWins = 0; // Count of total wins
    let results = [];
    const betAmount = Number(req.body.betAmount) || 0; // Store bet amount once
    for (let i = 1; i <= 100000; i++) {
      const Req = { body: req.body };
      const Res = {
        json: (data) => {
          // console.log(data.result,"data");

          if (data.result.win !== undefined) {
            totalWinSum += data.result.win;
            if (data.result.win > 0) {
              totalWins++; // Increment only if there is a win
            }
          }
          if (data.result.freeSpinWin !== undefined) {
            totalFreeSpins += data.result.freeSpinWin
          }
          // if (!data.result.freeSpinActive) {
          //   totalBetAmount += Number(req.body.betAmount) || 0;
          // }
    
          if (!data.result.freeSpinActive) {
            totalBetAmount += betAmount;
          }

          results.push(data);
        },
        status: () => Res,
      };

      console.log(i, "=>", "RTP", (totalWinSum / totalBetAmount) * 100, "totalWins count => ", totalWins, "total win= ", totalWinSum, "total bet = ", totalBetAmount);
      await spin(Req, Res);
    }

    // totalBetAmount -= totalFreeSpins * Number(req.body.betAmount);
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

async function convertReel(reels) {

  let response = [
    { reel: reels[0] },
    { reel: reels[1] },
    { reel: reels[2] },
    { reel: reels[3] },
    { reel: reels[4] },
  ];
  return response;
}

module.exports = { spin, looping };

