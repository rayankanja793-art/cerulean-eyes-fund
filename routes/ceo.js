const express = require("express");
const router = express.Router();
const path = require("path");

const Loan = require("../models/Loan");
const User = require("../models/User");

// Change these later
const CEO_USERNAME = "ceo";
const CEO_PASSWORD = "Cerulean2026";

// CEO Login Page
router.get("/ceo/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/ceo-login.html"));
});

// CEO Login
router.post("/ceo/login", (req, res) => {

    const { username, password } = req.body;

    if (
        username === CEO_USERNAME &&
        password === CEO_PASSWORD
    ) {

        req.session.ceo = true;

        return res.redirect("/ceo");
    }

    res.send("Invalid CEO username or password.");

});

// Protect CEO Dashboard
router.get("/ceo", (req, res) => {

    if (!req.session.ceo) {
        return res.redirect("/ceo/login");
    }

    res.sendFile(path.join(__dirname, "../views/ceo-dashboard.html"));

});

// CEO Statistics
router.get("/ceo/json", async (req, res) => {

    if (!req.session.ceo) {
        return res.status(401).send("Unauthorized");
    }

    try {

        const loans = await Loan.find();

        res.json(loans);

    } catch (err) {

        console.log(err);

        res.status(500).send("Error");

    }

});
// ===========================
// CEO Members List
// ===========================

router.get("/ceo/members/json", async (req, res) => {

    if (!req.session.ceo) {
        return res.status(401).send("Unauthorized");
    }

    try {

        const members = await User.find().sort({ createdAt: -1 });

        res.json(members);

    } catch (err) {

        console.log(err);

        res.status(500).send("Failed to load members.");

    }

});
// CEO Logout
router.get("/ceo/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/ceo/login");

    });

});

module.exports = router;