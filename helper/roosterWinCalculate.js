const checkPaylineWin = (reels, betAmount) => {
    let totalWin = 0;
    let winningLines = [];
    let isFight = false
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

    const wildSymbol = 0;

    if (!reels || !Array.isArray(reels) || reels.length < 3) {
        return { totalWin: 0, winningLines: [] };
    }

    isScatterWin = reels.every(reel => reel.includes(0));
    console.log("reels", isScatterWin);

    for (let l = 0; l < paylines.length; l++) {
        let lineData = [
            reels[0][paylines[l][0]],
            reels[1][paylines[l][1]],
            reels[2][paylines[l][2]],
        ];

        let mainSymbol = lineData[0];


        if (mainSymbol == null) continue;

        let matchCount = 0;

        for (let s of lineData) {
            if (s == mainSymbol) {
                matchCount++;
            }
        }

        if (matchCount == 3) {
            if (isScatterWin) {
                isFight = true
            }
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

    return { totalWin, winningLines, isFight };
};


module.exports = { checkPaylineWin };
