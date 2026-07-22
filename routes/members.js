const express = require("express");
const router = express.Router();
const path = require("path");

const User = require("../models/User");

// Members Page
router.get("/ceo/members", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/members.html"));
});

// Members JSON
router.get("/ceo/members/json", async (req, res) => {

    try{

        const users = await User.find().sort({createdAt:-1});

        res.json(users);

    }catch(err){

        console.log(err);
        res.status(500).send("Error");

    }

});
// View one member
router.get("/ceo/member/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send("Member not found");
        }

        res.json(user);

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});
module.exports = router;