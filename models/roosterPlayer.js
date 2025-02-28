const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
    username: { type: String, required: true,  },
    email: { type: String, required: true,  },
    password: { type: String, required: true },
    balance: { type: Number, default: 1000 },
    freeSpins: { type: Number, default: 0 },
    isfreespin: { type: Boolean, default: false },
    // reels: { type: [[String]], required: false },

},
    {
        timestamps: true
    });

module.exports = mongoose.model("Rooster_Player", PlayerSchema);