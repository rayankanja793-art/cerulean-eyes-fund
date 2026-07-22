const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");

const paymentConfig = require("../config/payment");
const Deposit = require("../models/Deposit");

const Transaction = require("../models/Transaction");

// Show Register Page
router.get("/register", (req, res) => {
    res.sendFile(require("path").join(__dirname, "../views/register.html"));
});

// Register User
router.post("/register", async (req, res) => {
    try {

        const { fullname, email, phone, nationalId, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.send("Passwords do not match");
        }

        // Check if phone already exists
const existingUser = await User.findOne({ phone });

if (existingUser) {
    return res.send("Phone number already registered");
}

        // Encrypt password
const hashedPassword = await bcrypt.hash(password, 10);

// Generate Member Code
const totalMembers = await User.countDocuments();

const memberCode = "CF" + String(totalMembers + 1).padStart(6, "0");

const user = new User({
    fullname,
    email,
    phone,
    nationalId,
    memberCode,
    password: hashedPassword
});
console.log("Generated Member Code:", memberCode);
console.log(user);
console.log("Member Code before save:", user.memberCode);

await user.save();

console.log("Member Code after save:", user.memberCode);
console.log(user);

res.send("Registration Successful!");

    } catch (err) {
        console.log(err);
        res.send("Registration Failed");
    }
});
// Show Login Page
router.get("/login", (req, res) => {
    res.sendFile(require("path").join(__dirname, "../views/login.html"));
});
// Login User
router.post("/login", async (req, res) => {
    try {

        const { phone, password } = req.body;

const user = await User.findOne({ phone });

if (!user) {
    return res.send("Invalid phone number or password");
}
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
           return res.send("Invalid phone number or password");
        }
        req.session.userId = user._id;
req.session.fullname = user.fullname;
req.session.phone = user.phone;
        
       res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.send("Login failed.");
    }
});
// Update Profile
router.post("/profile/update", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).send("Please login first.");
    }

    try {

        const { fullname, email } = req.body;

        await User.findByIdAndUpdate(req.session.userId, {
            fullname,
            email
        });

        res.send("Profile updated successfully.");

    } catch (err) {

        console.log(err);
        res.status(500).send("Failed to update profile.");

    }

});
// Show Dashboard
router.get("/dashboard", (req, res) => {
    res.sendFile(require("path").join(__dirname, "../views/dashboard.html"));
});
// Logged-in member information
router.get("/member/data", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).send("Not logged in");
    }

    try {

        const user = await User.findById(req.session.userId);

        res.json(user);

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});
// Show Profile Page
router.get("/profile", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../views/profile.html"));

});
// Update Profile
router.post("/profile/update", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).send("Not logged in");
    }

    try {

        const { fullname, email } = req.body;

        await User.findByIdAndUpdate(
            req.session.userId,
            {
                fullname,
                email
            }
        );

        res.send("Profile updated successfully");

    } catch (err) {

        console.log(err);
        res.status(500).send("Failed to update profile");

    }

});
// Change Password
router.post("/profile/password", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).send("Please login first.");
    }

    try {

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.session.userId);

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.send("Current password is incorrect.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.send("Password changed successfully.");

    } catch (err) {

        console.log(err);
        res.status(500).send("Failed to change password.");

    }

});
router.get("/deposit",(req,res)=>{

    if(!req.session.userId){
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname,"../views/deposit.html"));

});
router.post("/deposit", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).send("Please login first.");
    }

    try {

        const { amount } = req.body;

        const user = await User.findById(req.session.userId);

        const phoneToCharge = paymentConfig.TEST_MODE
            ? paymentConfig.TEST_PHONE
            : user.phone;

        const deposit = new Deposit({

            member: user._id,

            phone: phoneToCharge,

            amount,

            status: "Pending"

        });

        await deposit.save();

        res.send("Deposit request submitted successfully. Waiting for approval.");

    } catch (err) {

        console.log(err);
        res.status(500).send("Deposit failed.");

    }

});
// Logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send("Logout failed.");
        }

        res.redirect("/login");
    });
});
// Show Transfer Page
router.get("/transfer", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../views/transfer.html"));

});

// Find Member by Member Code
router.get("/member/:code", async (req, res) => {

    try {

        const user = await User.findOne({
            memberCode: req.params.code.toUpperCase()
        });

        if (!user) {
            return res.json({ found: false });
        }

        res.json({
            found: true,
            fullname: user.fullname,
            memberCode: user.memberCode
        });

    } catch (err) {

        console.log(err);
        res.status(500).json({ found: false });

    }

});

// Process Transfer
router.post("/transfer", async (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    try {

        const { memberCode, amount, description } = req.body;

        const sender = await User.findById(req.session.userId);

        const receiver = await User.findOne({
            memberCode: memberCode.toUpperCase()
        });

        if (!receiver) {
            return res.send("Recipient not found.");
        }

        if (String(sender._id) === String(receiver._id)) {
            return res.send("You cannot send money to yourself.");
        }

        if (Number(amount) <= 0) {
            return res.send("Invalid amount.");
        }

        if (sender.wallet < Number(amount)) {
            return res.send("Insufficient wallet balance.");
        }

        sender.wallet -= Number(amount);
        receiver.wallet += Number(amount);

        await sender.save();
        await receiver.save();

        await Transaction.create({
            sender: sender._id,
            receiver: receiver._id,
            amount: Number(amount),
            description
        });

        req.session.transferSuccess = {
            receiver: receiver.fullname,
            memberCode: receiver.memberCode,
            amount: Number(amount),
            balance: sender.wallet
        };

        res.redirect("/transfer?success=1");

    } catch (err) {

        console.log(err);
        res.status(500).send("Transfer failed.");

    }

});
router.get("/history", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.sendFile(path.join(__dirname, "../views/history.html"));

});
router.get("/history/data", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).send("Please login.");
    }

    try {

        const transactions = await Transaction.find({
            $or: [
                { sender: req.session.userId },
                { receiver: req.session.userId }
            ]
        })
        .populate("sender", "fullname memberCode")
        .populate("receiver", "fullname memberCode")
        .sort({ createdAt: -1 });

       res.json({
    currentUser: req.session.userId,
    transactions
});

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});
router.get("/dashboard/activity", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).send("Please login.");
    }

    try {

        const transactions = await Transaction.find({
            $or: [
                { sender: req.session.userId },
                { receiver: req.session.userId }
            ]
        })
        .populate("sender", "fullname")
        .populate("receiver", "fullname")
        .sort({ createdAt: -1 })
        .limit(5);

        res.json({
            currentUser: req.session.userId,
            transactions
        });

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});
module.exports = router;