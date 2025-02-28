const Player = require("../models/roosterPlayer.js");

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

function spinReels() {
    const symbols = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7
    ];
    return Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
}

function calculateWinnings(reels, bet) {
    let totalWin = 0;
    let scatterCount = 0;
    paylines.forEach((line) => {
        const symbol = reels[line[0]];
        if (symbol == reels[line[1]] && symbol == reels[line[2]] && symbol !== 0) {
            totalWin += paytable[symbol] * bet;
        }
    });
    reels.forEach((symbol) => {
        if (symbol == 0) scatterCount++;
    });
    if (scatterCount >= 3) totalWin += paytable.scatter * bet;
    return { totalWin, scatterCount };
}

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

    const reels = spinReels();
    const { totalWin, scatterCount } = calculateWinnings(reels, bet);
    let bonusGame = null;
    let riskGame = null;

    if (scatterCount >= 3) {
        bonusGame = playBonusGame();
        player.balance += bonusGame.totalPrize;
    }

    if (gamble && totalWin > 0) {
        riskGame = playRiskGame(totalWin);
        if (riskGame.result == "win") player.balance += totalWin;
        else if (riskGame.result == "lose") player.balance -= totalWin;
    } else {
        player.balance += totalWin - bet;
    }

    await player.save();

    res.send({ reels, totalWin, scatterCount, bonusGame, riskGame, balance: player.balance });
}

module.exports = { spin, };