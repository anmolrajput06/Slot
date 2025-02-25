const paylines = require("./paylines");

const checkPaylineWin = (reels, betAmount) => {
  let totalWin = 0;
  let winningLines = [];

  paylines.forEach((line, index) => {
    const symbolsOnLine = line.map(([reelIndex, rowIndex]) => reels[reelIndex][rowIndex]);

    let firstSymbol = symbolsOnLine.find(s => s !== "WILD") || "WILD";
    let matchCount = 1;

    for (let i = 1; i < symbolsOnLine.length; i++) {
      if (symbolsOnLine[i] === firstSymbol || symbolsOnLine[i] === "WILD") {
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const payoutMultiplier = getPayout(firstSymbol, matchCount);
      const winAmount = betAmount * payoutMultiplier;
      totalWin += winAmount;
      winningLines.push({ line: index + 1, symbol: firstSymbol, matchCount, payout: winAmount });
    }
  });


  return { totalWin, winningLines };
};


const getPayout = (symbol, count) => {
  const payoutTable = {
    "0": { 3: 5, 4: 10, 5: 50 },
    "1": { 3: 0.2, 4: 1, 5: 5 },
    "2": { 3: 0.15, 4: 0.5, 5: 1.5 },
    "3": { 3: 0.15, 4: 0.5, 5: 1.25 },
    "4": { 3: 0.1, 4: 0.3, 5: 1.0 },
    "5": { 3: 0.1, 4: 0.3, 5: 1.0 },
    "6": { 3: 0, 4: 0, 5: 0 },
    "7": { 3: 0, 4: 0, 5: 0 },
    "8": { 3: 5, 4: 10, 5: 50 },
  };
  return payoutTable[symbol]?.[count] || 0;
};




module.exports = { checkPaylineWin };
