const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    purpose: {
        type: String,
        required: true
    },

    duration: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Loan", loanSchema);