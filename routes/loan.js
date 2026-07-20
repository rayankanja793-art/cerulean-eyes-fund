const express = require("express");
const router = express.Router();
const path = require("path");

const Loan = require("../models/Loan");

// Show Loan Application Page
router.get("/loan", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/loan.html"));
});

// Save Loan Application
router.post("/apply-loan", async (req, res) => {

    try {

        const { userEmail, amount, duration, purpose } = req.body;

        const loan = new Loan({
            userEmail,
            amount,
            duration,
            purpose
        });

        await loan.save();

        res.send("✅ Loan application submitted successfully!");

    } catch (err) {

        console.log(err);
        res.send("❌ Failed to submit loan application.");

    }

});

module.exports = router;