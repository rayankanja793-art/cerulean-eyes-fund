const express = require("express");
const router = express.Router();
const path = require("path");

const Loan = require("../models/Loan");
const Investment = require("../models/Investment");
const Deposit = require("../models/Deposit");
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

router.get("/ceo/investments/json", async (req, res) => {

    if (!req.session.ceo) {
        return res.status(401).send("Unauthorized");
    }

    try {

        const investments = await Investment.find()
            .populate("member");

        res.json(investments);

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
// CEO Members Page
router.get("/ceo/members-page", (req, res) => {

    if (!req.session.ceo) {
        return res.redirect("/ceo/login");
    }

    res.sendFile(path.join(__dirname, "../views/ceo-members.html"));

});
// CEO Members API
router.get("/ceo/members", async (req, res) => {

    if (!req.session.ceo) {
        return res.status(401).send("Unauthorized");
    }

    try {

        const members = await User.find().select(
            "memberCode fullname phone email wallet createdAt"
        );

        res.json(members);

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});

// ===========================
// Investment Plans Page
// ===========================
router.get("/invest", (req, res) => {

    res.sendFile(path.join(__dirname, "../views/investments.html"));

})
// ===========================
// Individual Investment Plan
// ===========================
router.get("/invest/:plan", (req, res) => {

    res.sendFile(path.join(__dirname, "../views/invest-now.html"));

});
router.get("/ceo/investments", (req,res)=>{

if(!req.session.ceo){
return res.redirect("/ceo/login");
}

res.sendFile(path.join(__dirname,"../views/ceo-investments.html"));

});
// ===========================
// CEO Deposits Page
// ===========================
router.get("/ceo/deposits", (req, res) => {

    if (!req.session.ceo) {
        return res.redirect("/ceo/login");
    }

    res.sendFile(path.join(__dirname, "../views/ceo-deposits.html"));

});
// ===========================
// CEO Deposit List API
// ===========================
router.get("/ceo/deposits/json", async (req, res) => {

    if (!req.session.ceo) {
        return res.status(401).send("Unauthorized");
    }

    try {

        const deposits = await Deposit.find()
            .populate("member")
            .sort({ createdAt: -1 });

        res.json(deposits);

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});
module.exports = router;