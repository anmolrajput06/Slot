const paylines = require("./paylines");

// const checkPaylineWin = (reels, betAmount) => {
//   let totalWin = 0;
//   let winningLines = [];

//   paylines.forEach((line, index) => {
//     // const symbolsOnLine = line.map(([reelIndex, rowIndex]) => reels[reelIndex][rowIndex]);
//     const symbolsOnLine = line.map(([reelIndex, rowIndex]) => reels[reelIndex][rowIndex]);


//     let firstSymbol = symbolsOnLine.find(s => s !== "WILD") || "WILD";
//     let matchCount = 1;

//     for (let i = 1; i < symbolsOnLine.length; i++) {
//       if (symbolsOnLine[i] === firstSymbol || symbolsOnLine[i] === "WILD") {
//         matchCount++;
//       } else {
//         break;
//       }
//     }

//     if (matchCount >= 3) {
//       const payoutMultiplier = getPayout(firstSymbol, matchCount);
//       console.log(payoutMultiplier, "payoutMultiplier", betAmount, matchCount);

//       const winAmount = betAmount * payoutMultiplier;
//       console.log(winAmount, "winAmount");

//       totalWin += winAmount;
//       console.log(totalWin, "totalWin");

//       winningLines.push({ line: line, symbol: firstSymbol, matchCount, payout: winAmount });
//     }
//   });

//   return { totalWin, winningLines };
// };


const checkPaylineWin = (reels, betAmount) => {
  let totalWin = 0;
  let winningLines = [];

  paylines.forEach((line, index) => {
    const symbolsOnLine = line.map((rowIndex, reelIndex) => reels[rowIndex][reelIndex]);

    let firstSymbol = symbolsOnLine.find(s => s !== "WILD") || "WILD";
    let matchCount = 1;

    for (let i = 1; i < symbolsOnLine.length; i++) {
      if (symbolsOnLine[i] === firstSymbol || symbolsOnLine[i] === "WILD") {
        matchCount++;
      } else {
        break;
      }
    }
    console.log(matchCount, "matchCount");

    if (matchCount >= 3) {
      const payoutMultiplier = getPayout(firstSymbol, matchCount);
      const winAmount = matchCount * payoutMultiplier;
      console.log(winAmount, "winAmount", payoutMultiplier, betAmount, "betAmount");

      totalWin += winAmount;
      winningLines.push({ line: line, symbol: firstSymbol, matchCount, payout: winAmount });
    }
  });

  return { totalWin, winningLines };
};

const getPayout = (symbol, count) => {
  const payoutTable = {
    "1": { 3: 20.0, 4: 100.0, 5: 500.0 },
    "2": { 3: 15.0, 4: 50.0, 5: 150.0 },
    "3": { 3: 15.0, 4: 50.0, 5: 125.0 },
    "4": { 3: 15.0, 4: 50.0, 5: 125.0 },
    "5": { 3: 15.0, 4: 50.0, 5: 125.0 },
    "6": { 3: 15.0, 4: 50.0, 5: 125.0 },
    "7": { 3: 15.0, 4: 50.0, 5: 125.0 },
    "8": { 3: 15.0, 4: 50.0, 5: 125.0 },
    "9": { 3: 15.0, 4: 50.0, 5: 125.0 },
    "10": { 3: 15.0, 4: 50.0, 5: 125.0 }
  };
  return payoutTable[symbol]?.[count] || 0;
};

module.exports = { checkPaylineWin };