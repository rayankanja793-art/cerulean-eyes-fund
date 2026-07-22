const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({

    username: {
        type: String,
        unique: true
    },

    password: String,

    role: {
        type: String,
        default: "Admin"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Admin", adminSchema);