const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
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

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("Email already registered");
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullname,
            email,
            phone,
            nationalId,
            password: hashedPassword
        });

        await user.save();

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

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Invalid email or password");
        }

       res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.send("Login failed.");
    }
});
module.exports = router;
// Show Dashboard
router.get("/dashboard", (req, res) => {
    res.sendFile(require("path").join(__dirname, "../views/dashboard.html"));
});