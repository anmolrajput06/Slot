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


const generateRandomReel = (reelStrip) => {
    let randomInt = Math.floor(Math.random() * (reelStrip.length));
    let resultReel = [];
    resultReel.push(reelStrip[(randomInt + 0) % reelStrip.length]);
    resultReel.push(reelStrip[(randomInt + 1) % reelStrip.length]);
    resultReel.push(reelStrip[(randomInt + 2) % reelStrip.length]);
    return resultReel;
};


const checkFightOutcome = (reels, paylines, myPlayerSym, opponentPlayerSym, fightLevel = 1, fightRounds = 5) => {
    let fightHistory = [];
    let totalWin = 0;
    let maxFightLevel = 6;
    const fightAmounts = [300, 400, 500, 750, 1000, 1500];
    const payoutTable = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 };
    let opponentSymbols = [1, 2, 3, 4, 5, 6, 7].filter(sym => sym !== myPlayerSym);

    while (fightLevel <= maxFightLevel) {
        let fightData = { fightLevel, rounds: [] };
        let roundNumber = 1;
        let currentFightRounds = fightRounds;
        let totalPlayerPoints = 0;
        let totalOpponentPoints = 0;

        while (currentFightRounds > 0) {

            let playerPoints = 0;
            let opponentPoints = 0;
            let winningLines = [];
            let extraRounds = 0;

            const reelStrip = {
                1: [myPlayerSym, opponentPlayerSym, myPlayerSym, 0, opponentPlayerSym, myPlayerSym, 0, opponentPlayerSym, myPlayerSym, opponentPlayerSym, myPlayerSym],
                2: [myPlayerSym, opponentPlayerSym, 0, myPlayerSym, opponentPlayerSym, myPlayerSym, 0, opponentPlayerSym, 0, myPlayerSym, opponentPlayerSym, 0, myPlayerSym],
                3: [opponentPlayerSym, myPlayerSym, 0, opponentPlayerSym, myPlayerSym, opponentPlayerSym, 0, 0, myPlayerSym, opponentPlayerSym, myPlayerSym],
            };

            reels = [
                generateRandomReel(reelStrip[1]),
                generateRandomReel(reelStrip[2]),
                generateRandomReel(reelStrip[3])
            ];

            for (let l = 0; l < paylines.length; l++) {
                let lineData = [
                    reels[0][paylines[l][0]],
                    reels[1][paylines[l][1]],
                    reels[2][paylines[l][2]]
                ];
                let mainSymbol = lineData[0];
                if (mainSymbol == null) continue;

                let matchCount = lineData.filter(s => s == mainSymbol).length;
                if (matchCount == 3) {
                    let currentWin = fightAmounts[fightLevel - 1];
                    totalWin = currentWin;
                    winningLines.push({
                        symbol: mainSymbol,
                        lineNumber: l + 1,
                        line: paylines[l],
                        lineData,
                        symbolCount: matchCount,
                        totalWin: currentWin
                    });

                    if (mainSymbol == myPlayerSym) {
                        playerPoints += payoutTable[mainSymbol];
                    }
                    if (mainSymbol == opponentPlayerSym) {
                        opponentPoints += payoutTable[mainSymbol];
                    }
                    if (mainSymbol == 0) {
                        extraRounds += 3;
                    }
                }
            }

            totalPlayerPoints += playerPoints;
            totalOpponentPoints += opponentPoints;

            fightData.rounds.push({
                fightRounds: roundNumber,
                totalWin: winningLines.length > 0 ? totalWin : 0,
                playerPoints,
                opponentPoints,
                myPlayerSym,
                opponentPlayerSym,
                winningLines
            });

            currentFightRounds--;
            roundNumber++;

            currentFightRounds += extraRounds;
        }

        if (totalPlayerPoints === totalOpponentPoints) {
            fightRounds++;
        } else if (totalOpponentPoints > totalPlayerPoints) {
            fightHistory.push(fightData);
            return { totalWin, fightLevel, fightData: fightHistory };
        }

        fightHistory.push(fightData);
        opponentPlayerSym = opponentSymbols[Math.floor(Math.random() * opponentSymbols.length)];
        fightLevel++;
    }

    return { totalWin, fightLevel, fightData: fightHistory };
};

module.exports = { checkPaylineWin, checkFightOutcome };
