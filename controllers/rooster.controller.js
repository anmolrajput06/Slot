const Player = require("../models/roosterPlayer.js");
const { checkPaylineWin } = require("../helper/roosterWinCalculate.js")

let isFight = false

const paytable = {
    0: 0.25,  //scatter
    1: 5.0, //"golden_rooster"
    2: 1.0,//"purple_rooster"
    3: 0.50, //"red_rooster"
    4: 0.20, //"white_rooster"
    5: 0.07,// "dark_blue_rooster"
    6: 0.05, // "blue_rooster"
    7: 0.03  //"green_rooster"
};
const paylines = [
    [1, 1, 1],
    [0, 0, 0],
    [2, 2, 2],
    [0, 1, 2],
    [2, 0, 0],
];



function playBonusGame() {
    let totalPrize = 0;
    let fightResults = [];
    let round = 1;
    let wins = [6, 8, 10, 15, 20, 30];

    while (round <= 6) {
        const playerPoints = Math.floor(Math.random() * 5) + 1;
        const opponentPoints = Math.floor(Math.random() * 5) + 1;
        fightResults.push({ round, playerPoints, opponentPoints });
        if (playerPoints > opponentPoints) {
            totalPrize += wins[round - 1];
            round++;
        } else break;
    }
    return { fightResults, totalPrize };
}

function playRiskGame(wager) {
    const dealerCard = Math.floor(Math.random() * 13) + 2;
    const playerCard = Math.floor(Math.random() * 13) + 2;
    let result = "draw";

    if (playerCard > dealerCard) result = "win";
    else if (playerCard < dealerCard) result = "lose";

    return { dealerCard, playerCard, result };
}

const spin = async (req, res) => {
    const { username, bet, gamble } = req.body;
    const player = await Player.findOne({ username });
    if (!player || player.balance < bet) return res.status(400).send("Insufficient balance");
    let freeSpinActive = false
    const reelStrip = {
        1: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 3, 3, 1, 3, 4, 4, 1, 6, 7, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6],
        2: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 1, 6, 7, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6],
        3: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 3, 3, 3, 3, 4, 4, 1, 6, 7, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6],
    };

    let reels = [
        await generateRandomReels(reelStrip[1]),
        await generateRandomReels(reelStrip[2]),
        await generateRandomReels(reelStrip[3])
    ];
    // let reels = [
    //     [0, 3, 5,],
    //     [1, 5, 5],
    //     [5, 1, 2],

    // ]
    const { totalWin, isFight, winningLines } = checkPaylineWin(reels, bet);


    if (isFight) {
        console.log("fighting the game");

    } else {
        let bonusGame = null;
        let riskGame = null;
        if (gamble && totalWin > 0) {
            riskGame = playRiskGame(totalWin);
            if (riskGame.result == "win") player.balance += totalWin;
            else if (riskGame.result == "lose") player.balance -= totalWin;
        } else {
            player.balance += totalWin - bet;
        }

        // await player.save();

        response = {
            bet: bet,
            win: totalWin,
            reels: await convertReel(reels),
            winData: winningLines,
            // steckyReel: await convertReel(steckyReels),
        };


        return res.json({
            statusCode: 1,
            message: "Success",
            result: response
        });
    }


}

const generateRandomReels = (reelStrip) => {
    let randomInt = Math.floor(Math.random() * (reelStrip.length));
    let resultReel = [];
    resultReel.push(reelStrip[(randomInt + 0) % reelStrip.length]);
    resultReel.push(reelStrip[(randomInt + 1) % reelStrip.length]);
    resultReel.push(reelStrip[(randomInt + 2) % reelStrip.length]);
    return resultReel;
};



const looping = async (req, res) => {
    try {
        let totalWinSum = 0;
        let totalBetAmount = 0;
        let totalFreeSpins = 0;
        let totalWins = 0;
        let results = [];
        const betAmount = Number(req.body.bet) || 0;
        for (let i = 1; i <= 100000; i++) {
            const Req = { body: req.body };
            const Res = {
                json: (data) => {

                    if (data.result.win !== undefined) {
                        totalWinSum += data.result.win;
                        if (data.result.win > 0) {
                            totalWins++;
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
        console.log(error);

        res.status(500).json({ message: "Error in looping", error });
    }
};


async function convertReel(reels) {

    let response = [
        { reel: reels[0] },
        { reel: reels[1] },
        { reel: reels[2] },

    ];
    return response;
}
module.exports = { spin, looping };