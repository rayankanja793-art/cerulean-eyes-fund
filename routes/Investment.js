const express = require("express");
const router = express.Router();

const Investment = require("../models/investment");
const User = require("../models/User");

router.post("/invest", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }

        const {
            plan,
            amount,
            roi,
            duration,
            expectedReturn
        } = req.body;

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Member not found."
            });
        }

        if (user.wallet < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance."
            });
        }

        // Calculate maturity date
        let maturityDate = new Date();

        switch (duration) {

            case "14 Days":
                maturityDate.setDate(maturityDate.getDate() + 14);
                break;

            case "21 Days":
                maturityDate.setDate(maturityDate.getDate() + 21);
                break;

            case "30 Days":
                maturityDate.setDate(maturityDate.getDate() + 30);
                break;

            case "60 Days":
                maturityDate.setDate(maturityDate.getDate() + 60);
                break;

            case "90 Days":
                maturityDate.setDate(maturityDate.getDate() + 90);
                break;

            case "180 Days":
                maturityDate.setDate(maturityDate.getDate() + 180);
                break;
        }

        // Deduct wallet
        user.wallet -= amount;
        await user.save();

        // Save investment
        const investment = new Investment({

            member: user._id,

            plan,
            amount,
            roi,
            duration,
            expectedReturn,

            maturityDate,

            status: "Active"

        });

        await investment.save();

        res.json({
            success: true,
            message: "Investment created successfully."
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

module.exports = router;