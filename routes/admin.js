const express = require("express");
const router = express.Router();
const path = require("path");

const Loan = require("../models/Loan");
const Deposit = require("../models/Deposit");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

// Admin Dashboard Page
router.get("/admin", (req, res) => {

    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }

    res.sendFile(path.join(__dirname, "../views/admin.html"));

});

// Return all loans as JSON
router.get("/admin/loans/json", async (req, res) => {

    try {

        const loans = await Loan.find().sort({ createdAt: -1 });

        res.json(loans);

    } catch (err) {

        console.log(err);
        res.status(500).send("Error loading loans.");

    }

});

// Approve Loan
router.post("/admin/approve/:id", async (req, res) => {

    try {

        await Loan.findByIdAndUpdate(req.params.id, {
            status: "Approved"
        });

        res.redirect("/admin");

    } catch (err) {

        console.log(err);
        res.send("Error approving loan.");

    }

});

// Reject Loan
router.post("/admin/reject/:id", async (req, res) => {

    try {

        await Loan.findByIdAndUpdate(req.params.id, {
            status: "Rejected"
        });

        res.redirect("/admin");

    } catch (err) {

        console.log(err);
        res.send("Error rejecting loan.");

    }

});
// Show Deposit Requests Page
router.get("/admin/deposits", (req, res) => {

    res.sendFile(path.join(__dirname, "../views/admin-deposits.html"));

});

// Return All Deposits
router.get("/admin/deposits/list", async (req, res) => {

    try {

        const deposits = await Deposit.find()
            .populate("member")
            .sort({ createdAt: -1 });

        res.json(deposits);

    } catch (err) {

        console.log(err);
        res.status(500).send("Error loading deposits.");

    }

});
// Approve Deposit
// Approve Deposit
router.post("/admin/deposit/:id", async (req, res) => {

    try {

        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {
            return res.send("Deposit not found.");
        }

        if (deposit.status === "Approved") {
            return res.send("This deposit has already been approved.");
        }

        // Mark deposit as approved
        deposit.status = "Approved";
        await deposit.save();

        // Credit member's wallet
        const user = await User.findById(deposit.member);

        if (!user) {
            return res.send("Member not found.");
        }

        user.wallet += Number(deposit.amount);

        await user.save();

        res.send("Deposit approved and wallet credited successfully.");

    } catch (err) {

        console.log(err);
        res.status(500).send("Failed to approve deposit.");

    }

});
// Show Admin Login Page
router.get("/admin/login", (req, res) => {

    res.sendFile(path.join(__dirname, "../views/admin-login.html"));

});

// Admin Login
router.post("/admin/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.send("Invalid username or password.");
        }

        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
            return res.send("Invalid username or password.");
        }

        req.session.isAdmin = true;
        req.session.adminId = admin._id;
        req.session.adminRole = admin.role;

        res.redirect("/admin");

    } catch (err) {

        console.log(err);
        res.status(500).send("Login failed.");

    }

});
// Admin Logout
router.get("/admin/logout", (req, res) => {

    req.session.destroy(err => {

        if (err) {
            return res.send("Logout failed.");
        }

        res.redirect("/admin/login");

    });

});
module.exports = router;