require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const app = express();

// ===========================
// Portal Password
// ===========================
const PORTAL_PASSWORD = "CeruleanPortal2026";

// ===========================
// MongoDB Connection
// ===========================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ===========================
// Middleware
// ===========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),

    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// ===========================
// Routes
// ===========================
const authRoutes = require("./routes/auth");
const loanRoutes = require("./routes/loan");
const adminRoutes = require("./routes/admin");
const ceoRoutes = require("./routes/ceo");
const membersRoutes = require("./routes/members");

app.use(authRoutes);
app.use(loanRoutes);
app.use(adminRoutes);
app.use("/", ceoRoutes);
app.use(membersRoutes);

// ===========================
// Home Page
// ===========================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ===========================
// Portal Login Page
// ===========================
app.get("/portal/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "portal-login.html"));
});

// ===========================
// Portal Password Check
// ===========================
app.post("/portal/login", (req, res) => {

    const { password } = req.body;

    if (password === PORTAL_PASSWORD) {

        req.session.portalAccess = true;

        return res.redirect("/portal");
    }

    res.send("Incorrect portal password.");

});

// ===========================
// Protected Portal
// ===========================
app.get("/portal", (req, res) => {

    if (!req.session.portalAccess) {
        return res.redirect("/portal/login");
    }

    res.sendFile(path.join(__dirname, "views", "portal.html"));

});

// ===========================
// Exit Portal
// ===========================
app.get("/portal/logout", (req, res) => {

    req.session.portalAccess = false;

    res.redirect("/");

});

// ===========================
// Test Routes
// ===========================
app.get("/hello", (req, res) => {
    res.send("Hello from server");
});

app.get("/test", (req, res) => {
    res.send("Test route is working!");
});

// ===========================
// Start Server
// ===========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});