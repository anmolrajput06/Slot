const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 1000 }, 
    freeSpins: { type: Number, default: 0 }, 
},
    {
        timestamps: true
    });

module.exports = mongoose.model("Player", PlayerSchema);
