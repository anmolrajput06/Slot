const mongoose = require("mongoose");

const SlotGameSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    reels: { type: [[String]], required: true }, 
    freeSpins: { type: Number, default: 0 },
    persistingWilds: { type: [[Boolean]], default: [[false, false, false, false, false]] },
    winnings: { type: Number, default: 0 },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("SlotGame", SlotGameSchema);
