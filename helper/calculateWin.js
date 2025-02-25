const paylines = require("./paylines");

const checkPaylineWin = (reels, betAmount) => {
  let totalWin = 0;
  let winningLines = [];

  paylines.forEach((line) => {
    let matchCount = 0;
    let firstSymbol = null;
    let visitedReels = new Set(); // Track reels to avoid duplicate counts
    let isContinuous = true;

    for (let reelIndex = 0; reelIndex < line.length; reelIndex++) {
      const rowIndex = line[reelIndex];
      const symbol = reels[reelIndex][rowIndex];

      if (firstSymbol === null && symbol !== "11") {
        firstSymbol = symbol; // First symbol set karna
      }

      if (visitedReels.has(reelIndex)) {
        continue; // Agar reel pehle count ho chuki hai toh skip
      }

      if (symbol === firstSymbol || symbol === "11") {
        matchCount++;
        visitedReels.add(reelIndex); // Mark reel as visited
      } else {
        isContinuous = false; // Agar mismatch hua toh break karna
        break;
      }
    }

    if (matchCount >= 3 && isContinuous) {
      const payoutMultiplier = getPayout(firstSymbol, matchCount);
      const winAmount =   payoutMultiplier;
      totalWin += winAmount;

      winningLines.push({ line, symbol: firstSymbol, matchCount, payout: winAmount });
    }
  });

  return { totalWin, winningLines };
};

const getPayout = (symbol, count) => {
  const payoutTable = {
    "0": { 3: 20, 4: 100, 5: 500 },
    "1": { 3: 15, 4: 50, 5: 150 },
    "2": { 3: 15, 4: 50, 5: 125 },
    "3": { 3: 15, 4: 50, 5: 125 },
    "4": { 3: 15, 4: 50, 5: 125 },
    "5": { 3: 15, 4: 50, 5: 125 },
    "6": { 3: 15, 4: 50, 5: 125 },
    "7": { 3: 15, 4: 50, 5: 125 },
    "8": { 3: 15, 4: 50, 5: 125 },
    "9": { 3: 15, 4: 50, 5: 125 },
    "10": { 3: 15, 4: 50, 5: 125 },
    "11": { 3: 15, 4: 50, 5: 125 }, // Wild
    "12": { 3: 15, 4: 50, 5: 125 },
    "13": { 3: 15, 4: 50, 5: 125 },
    "14": { 3: 15, 4: 50, 5: 125 }
  };
  return payoutTable[symbol]?.[count] || 0;
};

module.exports = { checkPaylineWin };
