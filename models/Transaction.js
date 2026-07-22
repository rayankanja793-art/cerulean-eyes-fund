const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    amount: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Completed"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);