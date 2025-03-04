const checkPaylineWin = (reels, betAmount) => {
    let totalWin = 0;
    let winningLines = [];
    let isFight = false;

    const payoutTable = {
        0: 0.25,  // scatter
        1: 5.0,    // "golden_rooster"
        2: 1.0,    // "purple_rooster"
        3: 0.50,   // "red_rooster"
        4: 0.20,   // "white_rooster"
        5: 0.07,   // "dark_blue_rooster"
        6: 0.05,   // "blue_rooster"
        7: 0.03    // "green_rooster"
    };

    const paylines = [
        [1, 1, 1], // Payline 1
        [0, 0, 0], // Payline 2
        [2, 2, 2], // Payline 3
        [0, 1, 2], // Payline 4 (Diagonal)
        [2, 1, 0], // Payline 5(Diagonal)
    ];

    if (!reels || !Array.isArray(reels) || reels.length < 3) {
        return { totalWin: 0, winningLines: [] };
    }

    let isScatterWin = reels.every(reel => reel.includes(0));

    for (let l = 0; l < paylines.length; l++) {
        let lineData = [
            reels[0][paylines[l][0]],
            reels[1][paylines[l][1]],
            reels[2][paylines[l][2]],
        ];

        let mainSymbol = lineData[0];
        if (mainSymbol == null) continue;

        let matchCount = lineData.filter(s => s === mainSymbol).length;

        if (matchCount == 3) {
            let currentWin = payoutTable[mainSymbol] * betAmount;
            let winData = {
                symbol: mainSymbol,
                lineNumber: l + 1,
                line: paylines[l],
                lineData,
                symbolCount: matchCount,
                totalWin: currentWin
            };
            totalWin += currentWin;
            winningLines.push(winData);
        }
    }

    if (isScatterWin) {
        let scatterIndexes = reels.map(reel => reel.indexOf(0));
        let scatterWinData = {
            symbol: 0,
            lineNumber: 0,
            line: scatterIndexes,
            lineData: [
                reels[0][scatterIndexes[0]],
                reels[1][scatterIndexes[1]],
                reels[2][scatterIndexes[2]],
            ],
            symbolCount: 3,
            totalWin: payoutTable[0] * betAmount * 3
        };

        // Ensure only one scatter win entry
        if (!winningLines.some(win => win.symbol == 0)) {
            totalWin += scatterWinData.totalWin;
            winningLines.push(scatterWinData);
            isFight = true;
        }
    }

    return { totalWin, winningLines, isFight };
};


// const checkFightOutcome = (reels, paylines, myPlayerSym, opponentPlayerSym, fightLevel = 1, fightHistory = []) => {
//     let playerPoints = 0;
//     let opponentPoints = 0;
//     let totalWin = 0;
//     let isFight = false;
//     let winningLines = [];

//     const maxFightLevel = 6;
//     const fightAmounts = [300, 400, 500, 750, 1000, 1500];

//     const payoutTable = {
//         0: 0.25, 1: 5.0, 2: 1.0, 3: 0.50,
//         4: 0.20, 5: 0.07, 6: 0.05, 7: 0.03
//     };

//     // Iterate through all paylines to check for matches
//     for (let l = 0; l < paylines.length; l++) {
//         let lineData = [
//             reels[0][paylines[l][0]],
//             reels[1][paylines[l][1]],
//             reels[2][paylines[l][2]]
//         ];

//         let mainSymbol = lineData[0];
//         if (mainSymbol == null) continue;

//         let matchCount = lineData.filter(s => s == mainSymbol).length;

//         if (matchCount === 3) {
//             let currentWin = payoutTable[mainSymbol] * fightAmounts[fightLevel - 1];
//             totalWin += currentWin;

//             winningLines.push({
//                 symbol: mainSymbol,
//                 lineNumber: l + 1,
//                 line: paylines[l],
//                 lineData,
//                 symbolCount: matchCount,
//                 totalWin: currentWin
//             });

//             if (mainSymbol == myPlayerSym) playerPoints += 10;
//             if (mainSymbol == opponentPlayerSym) opponentPoints += 10;
//         }
//     }


//     fightHistory.push({
//         fightLevel,
//         totalWin,
//         playerPoints,
//         opponentPoints,
//         myPlayerSym,
//         opponentPlayerSym,
//         winningLines
//     });


//     if (opponentPoints >= playerPoints || fightLevel >= maxFightLevel) {
//         return { totalWin, isFight: false, winningLines, fightLevel, playerPoints, myPlayerSym, opponentPoints, opponentPlayerSym, fightHistory };
//     }


//     fightLevel++;
//     totalWin += fightAmounts[fightLevel - 1];
//     isFight = true;


//     let availableSymbols = [1, 2, 3, 4, 5, 6, 7].filter(sym => sym !== myPlayerSym && sym !== opponentPlayerSym);
//     if (availableSymbols.length > 0) {
//         opponentPlayerSym = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
//     }


//     return checkFightOutcome(generateNewReels(myPlayerSym, opponentPlayerSym), paylines, myPlayerSym, opponentPlayerSym, fightLevel, fightHistory);
// };



const checkFightOutcome = (reels, paylines, myPlayerSym, opponentPlayerSym, fightLevel = 1, fightRounds = 5, fightHistory = []) => {
    let playerPoints = 0;
    let opponentPoints = 0;
    let totalWin = 0;
    let isFight = false;
    let winningLines = [];
    let zeroSymbolFound = false;

    const maxFightLevel = 6;
    const fightAmounts = [300, 400, 500, 750, 1000, 1500];

    const payoutTable = {
        0: 0.25,
        1: 5.0,
        2: 1.0,
        3: 0.50,
        4: 0.20,
        5: 0.07,
        6: 0.05,
        7: 0.03
    };


    for (let l = 0; l < paylines.length; l++) {
        let lineData = [
            reels[0][paylines[l][0]],
            reels[1][paylines[l][1]],
            reels[2][paylines[l][2]]
        ];

        let mainSymbol = lineData[0];
        if (mainSymbol == null) continue;

        let matchCount = lineData.filter(s => s == mainSymbol).length;

        if (matchCount === 3) {
            let currentWin = payoutTable[mainSymbol] * fightAmounts[fightLevel - 1];
            totalWin += currentWin;

            winningLines.push({
                symbol: mainSymbol,
                lineNumber: l + 1,
                line: paylines[l],
                lineData,
                symbolCount: matchCount,
                totalWin: currentWin
            });

            if (mainSymbol == myPlayerSym) playerPoints += 1;
            if (mainSymbol == opponentPlayerSym) opponentPoints += 1;
            if (mainSymbol == 0) zeroSymbolFound = true;

        }
    }

    fightHistory.push({
        fightLevel,
        fightRounds,
        totalWin,
        playerPoints,
        opponentPoints,
        myPlayerSym,
        opponentPlayerSym,
        winningLines
    });



    
    if (opponentPoints > playerPoints) {
        return { totalWin:0, isFight: false, winningLines, fightLevel, fightRounds, playerPoints, myPlayerSym, opponentPoints, opponentPlayerSym, fightHistory };
    }


    // if (playerPoints === opponentPoints && playerPoints !== 0) {
    //     fightRounds = 6;
    // }


    if (playerPoints === opponentPoints) {
        fightRounds += 1; 
    }


    if (reels.flat().every(symbol => symbol == 0)) {
        fightRounds += 3;
    }

    // if (zeroSymbolFound) {
    //     fightRounds += 3;
    // }


    if (opponentPoints < playerPoints && fightLevel < maxFightLevel) {
        fightLevel++;
    }

    if (fightLevel >= maxFightLevel) {
        return { totalWin, isFight: false, winningLines, fightLevel, fightRounds, playerPoints, myPlayerSym, opponentPoints, opponentPlayerSym, fightHistory };
    }


    totalWin += fightAmounts[Math.min(fightLevel - 1, fightAmounts.length - 1)];
    isFight = true;


    let availableSymbols = [1, 2, 3, 4, 5, 6, 7].filter(sym => sym !== myPlayerSym && sym !== opponentPlayerSym);
    if (availableSymbols.length > 0) {
        opponentPlayerSym = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
    }

    return checkFightOutcome(generateNewReels(myPlayerSym, opponentPlayerSym), paylines, myPlayerSym, opponentPlayerSym, fightLevel, fightRounds, fightHistory);
};

const generateNewReels = (myPlayerSym, opponentPlayerSym) => {
    let reels = [
         [myPlayerSym, opponentPlayerSym, opponentPlayerSym],
         [0, myPlayerSym, 0],
         [0, 0, myPlayerSym],
     ]

 console.log("🎰 New Reels Generated:", reels);
 return reels;
};


module.exports = { checkPaylineWin, checkFightOutcome };
