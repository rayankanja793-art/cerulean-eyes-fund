const upload = require("../config/multer");
const User = require("../models/User");
const express = require("express");
const router = express.Router();
const path = require("path");

const Loan = require("../models/Loan");

// Show Loan Application Page
router.get("/loan", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/loan.html"));
});

// Save Loan Application
router.post(
    "/apply-loan",
    upload.fields([
        { name: "idFront", maxCount: 1 },
        { name: "idBack", maxCount: 1 }
    ]),
    async (req, res) => {

        try {

            const { amount, duration, purpose } = req.body;

            // Temporary until sessions are added
            const userEmail = req.body.userEmail.trim().toLowerCase();
   
        const user = await User.findOne({
    email: new RegExp("^" + userEmail + "$", "i")
});
           
    if (!user) {
                return res.send("User not found.");
            }

            const loan = new Loan({
                fullName: user.fullname,
                phone: user.phone,
                nationalId: user.nationalId,
                userEmail: user.email,

                amount,
                duration,
                purpose,

                idFront: req.files.idFront[0].path,
                idBack: req.files.idBack[0].path
            });

            await loan.save();

            res.redirect("/dashboard");

        } catch (err) {

            console.log(err);
            res.send("❌ Failed to submit loan application.");

        }

    }
);


module.exports = router;