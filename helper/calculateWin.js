const lines = require("./paylines");

const checkPaylineWin = (reels, betAmount) => {
  let totalWin = 0;
  let winningLines = [];
  const payoutTable = {
    0: { 3: 0.20, 4: 1, 5: 5 },   // man + bear
    1: { 3: 0.15, 4: 0.50, 5: 1.50 }, // mahal
    2: { 3: 0.15, 4: 0.50, 5: 1.25 }, // BIER
    3: { 3: 0.15, 4: 0.50, 5: 1 }, // chirag
    4: { 3: 0.10, 4: 0.25, 5: 1 },  // accordion
    5: { 3: 0.10, 4: 0.25, 5: 1 },  // nuts
    6: { 3: 0.5, 4: 0.15, 5: 0.75 }, //blue hearts
    7: { 3: 0.5, 4: 0.15, 5: 0.75 }, //red hearts
    8: { 3: 0.5, 4: 0.15, 5: 0.75 }, //   clubs
    9: { 3: 0.5, 4: 0.15, 5: 0.75 }, // diamonds
    10: { 3: 0, 4: 0, 5: 0 }, // Wild
    11: { 3: 0, 4: 0, 5: 0 },  // Feature
    12: { 3: 0, 4: 0, 5: 0 },  //  gold Feature
    13: { 3: 0, 4: 0, 5: 0 }, // wild  Feature
    14: { 3: 0, 4: 0, 5: 0 }   //presisting  wild
  };





  const lines = [
    [0, 0, 0, 0, 0],
    [3, 3, 3, 3, 3],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [3, 2, 1, 2, 3],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [1, 2, 3, 2, 1],
    [2, 1, 3, 1, 2],
    [3, 2, 3, 2, 3],
    [0, 1, 0, 1, 0],
    [3, 1, 3, 1, 3],
    [1, 0, 1, 0, 1],
    [0, 2, 0, 2, 0],
    [1, 2, 0, 2, 1],
    [3, 2, 2, 2, 3],
    [1, 0, 0, 0, 1],
    [2, 3, 3, 3, 2],
    [1, 2, 2, 2, 1],
    [1, 1, 2, 1, 1],
    [0, 0, 1, 0, 0],
    [3, 3, 2, 3, 3],
    [1, 1, 0, 1, 1],
    [2, 2, 3, 2, 2],
    [2, 1, 1, 1, 2],
    [2, 2, 1, 2, 2],
    [0, 0, 0, 1, 2],
    [3, 3, 3, 2, 1],
    [2, 2, 1, 0, 0],
    [0, 1, 1, 1, 2],
    [0, 0, 1, 2, 2],
    [3, 3, 2, 1, 1],
    [1, 1, 2, 3, 3],
    [0, 1, 2, 2, 2],
    [3, 2, 3, 3, 3],
    [3, 2, 2, 2, 1],
    [1, 0, 1, 2, 1],
    [2, 3, 2, 1, 2],
    [0, 1, 0, 0, 0],
    [3, 2, 1, 1, 1]

  ];

  if (!lines || !Array.isArray(lines)) {
    console.error("Lines data is missing or incorrect.");
    return { totalWin: 0, winningLines: [] };
  }



  for (let l = 0; l < lines.length; l++) {
    let sym = 0;
    let wild = "10";
    let lineData = [
      reels[0][lines[l][0]],
      reels[1][lines[l][1]],
      reels[2][lines[l][2]],
      reels[3][lines[l][3]],
      reels[4][lines[l][4]]
    ];

    for (let s = 0; s < lineData.length; s++) {
      if (lineData[s] != wild) {
        sym = lineData[s];
        break;
      }
    }

    let currentWin = 0;
    let winData = null;

    if (
      (lineData[0] == sym || lineData[0] == wild) &&
      (lineData[1] == sym || lineData[1] == wild) &&
      (lineData[2] == sym || lineData[2] == wild) &&
      (lineData[3] == sym || lineData[3] == wild) &&
      (lineData[4] == sym || lineData[4] == wild)) {
      currentWin = payoutTable[sym][5]
      winData = { symbol: sym, lineNumber: l + 1, line: lines[l], lineData, symbolCount: 5, totalWin: currentWin };
    } else if (
      (lineData[0] == sym || lineData[0] == wild) &&
      (lineData[1] == sym || lineData[1] == wild) &&
      (lineData[2] == sym || lineData[2] == wild) &&
      (lineData[3] == sym || lineData[3] == wild)) {
      currentWin = payoutTable[sym][4]
      winData = { symbol: sym, lineNumber: l + 1, line: lines[l], lineData, symbolCount: 4, totalWin: currentWin };
    } else if (
      (lineData[0] == sym || lineData[0] == wild) &&
      (lineData[1] == sym || lineData[1] == wild) &&
      (lineData[2] == sym || lineData[2] == wild)) {
      currentWin = payoutTable[sym][3]
      winData = { symbol: sym, lineNumber: l + 1, line: lines[l], lineData, symbolCount: 3, totalWin: currentWin };
    }

    if (winData) {
      totalWin += winData.totalWin;
      const totalBet = betAmount * lines.length;
      let RTP = (totalWin / totalBet) * 100;
      // console.log(`RTP: ${RTP.toFixed(2)}%`);
      winningLines.push(winData);
    }
  }

  return { totalWin, winningLines };
};


module.exports = { checkPaylineWin };
