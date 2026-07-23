const express = require("express");
const router = express.Router();

const Deposit = require("../models/Deposit");
const User = require("../models/User");

// Member submits a deposit
router.post("/deposit", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send("Please login first.");
        }

        const { amount } = req.body;

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).send("Member not found.");
        }

        const deposit = new Deposit({
            member: user._id,
            phone: user.phone,
            amount: Number(amount),
            status: "Pending"
        });

        await deposit.save();

        res.json({
            success: true,
            message: "Deposit request submitted successfully."
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});
// ===========================
// CEO Approves Deposit
// ===========================
router.post("/ceo/deposits/approve/:id", async (req, res) => {

    try {

        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {
            return res.status(404).json({
                message: "Deposit not found"
            });
        }

        if (deposit.status === "Approved") {
            return res.json({
                message: "Deposit already approved"
            });
        }

        const user = await User.findById(deposit.member);

        if (!user) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        // Add money to wallet
        user.wallet += deposit.amount;
        await user.save();

        deposit.status = "Approved";
        await deposit.save();

        res.json({
            success: true,
            message: "Deposit approved successfully."
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
module.exports = router;