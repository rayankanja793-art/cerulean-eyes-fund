const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({

    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    phone: String,

    amount: Number,

    status: {
        type: String,
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Deposit", depositSchema);