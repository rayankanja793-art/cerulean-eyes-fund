const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({

    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    plan: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    expectedReturn: {
        type: Number,
        required: true
    },

    roi: {
        type: Number,
        required: true
    },

    duration: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "Active"
    },

    startDate: {
        type: Date,
        default: Date.now
    },

    maturityDate: {
        type: Date
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Investment", investmentSchema);