const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    nationalId: {
        type: String,
        required: true
    },

    userEmail: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    duration: {
        type: String,
        required: true
    },

    purpose: {
        type: String,
        required: true
    },

    idFront: {
        type: String,
        required: true
    },

    idBack: {
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