const mongoose = require("mongoose");

console.log("User model loaded");

const userSchema = new mongoose.Schema({

    fullname: String,

    email: {
        type: String,
        unique: true
    },

    phone: String,

    nationalId: String,
memberCode: {
    type: String,
    unique: true
},
    password: String,

    wallet: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);