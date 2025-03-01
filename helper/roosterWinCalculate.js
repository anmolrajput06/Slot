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



const fightAmounts = [300, 400, 500, 750, 1000, 1500];

const checkFightOutcome = (reels, paylines) => {
    let fightLevel = 1;
    let fightRound = 1;
    let playerPoints = 0;
    let opponentPoints = 0;
    let maxRounds = 5;
    
    while (fightLevel <= 6) {
        let myPlayerSym = reels[Math.floor(Math.random() * reels.length)][Math.floor(Math.random() * 3)];
        let opponentPlayerSym = reels[Math.floor(Math.random() * reels.length)][Math.floor(Math.random() * 3)];

        let playerWin = 0;
        let opponentWin = 0;

        // Check if myPlayerSym is part of a payline
        let playerMatch = paylines.some(payline =>
            payline.every((pos, index) => reels[index][pos] === myPlayerSym)
        );

        if (playerMatch) {
            playerWin = fightAmounts[fightLevel - 1];
            opponentWin = 0; // Opponent gets nothing if player wins by payline match
        }
        
        playerPoints += playerWin;
        opponentPoints += opponentWin;

        if (playerPoints > opponentPoints) {
            fightLevel++;
        } else if (playerPoints < opponentPoints) {
            fightLevel++;
        } else {
            fightRound++;
        }

        if (fightRound > maxRounds) fightRound++;

        let hasScatter = reels.some(row => row.includes(0));
        if (hasScatter) fightRound += 3;

        if (fightLevel > 6) break;
    }

    return { fightLevel, fightRound, playerPoints, opponentPoints };
};


module.exports = { checkPaylineWin,checkFightOutcome };
