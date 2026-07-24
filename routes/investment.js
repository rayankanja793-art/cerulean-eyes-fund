const express = require("express");
const router = express.Router();

const path = require("path");
const PDFDocument = require("pdfkit");

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
            message: "investment created successfully."
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});
router.get("/my-investments", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }

        const investments = await Investment
            .find({ member: req.session.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            investments
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});
router.get("/investment/:id/pdf", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.status(401).send("Please login first.");
        }

        const investment = await Investment.findOne({
            _id: req.params.id,
            member: req.session.userId
        }).populate("member");

        const statementNo =
    "CF-INV-" + investment._id.toString().slice(-6).toUpperCase();

    const generatedDate = new Date().toLocaleDateString();

        if (!investment) {
            return res.status(404).send("Investment not found.");
        }

        const doc = new PDFDocument({ margin: 50 });

        // Blue page border
doc
    .lineWidth(2)
    .strokeColor("#0057b8")
    .rect(20, 20, 555, 800)
    .stroke();

// Reset drawing color
doc.strokeColor("black");

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Investment-${investment._id}.pdf`
        );

        doc.pipe(res);

       const path = require("path");

const logoPath = path.join(__dirname, "../public/images/logo.png");
doc.image(logoPath, 240, 30, {
    width: 120
});

doc.moveDown(5);

doc
    .fontSize(24)
    .fillColor("#0057b8")
    .text("CERULEAN FUNDS", {
        align: "center"
    });

doc
    .moveDown(0.3)
    .fontSize(11)
    .fillColor("gray")
    .text("Invest Today. Transform Tomorrow..", {
        align: "center"
    });

doc.moveDown(2);

        doc.moveDown();

        doc
    .fontSize(18)
    .text("Investment Statement", {
        align: "center"
    });

doc
    .moveDown(0.3)
    .fontSize(11)
    .fillColor("gray")
    .text(`Statement No: ${statementNo}`, {
        align: "center"
    });

doc
    .fontSize(11)
    .text(`Generated: ${generatedDate}`, {
        align: "center"
    });

doc.moveDown(1);

        doc.moveDown(2);

     doc.fontSize(12);
const rows = [
    ["Member Name", investment.member.fullname],
    ["Member Code", investment.member.memberCode],
    ["Investment Plan", investment.plan],
    ["Amount Invested", `KES ${investment.amount.toLocaleString()}`],
    ["Expected Return", `KES ${investment.expectedReturn.toLocaleString()}`],
    ["ROI", `${investment.roi}%`],
    ["Duration", investment.duration],
    ["Status", investment.status],
    ["Start Date", new Date(investment.startDate).toLocaleDateString()],
    ["Maturity Date", new Date(investment.maturityDate).toLocaleDateString()]
];
// Table Header
let y = doc.y;

// Blue Header
doc
    .fillColor("#0057b8")
    .rect(50, y, 495, 30)
    .fill();

doc
    .fillColor("white")
    .fontSize(14)
    .text("Investment Details", 60, y + 8);

doc.fillColor("black");

// Move below the blue header
y += 30;


rows.forEach(row => {

    doc
        .rect(50, y, 170, 25)
        .stroke();

    doc
        .rect(220, y, 325, 25)
        .stroke();

    doc.text(row[0], 60, y + 7);

    doc.text(row[1], 230, y + 7);

    y += 25;

});

// ===========================
// Fixed Footer Position
// ===========================

const footerY = y + 25;

// Disclaimer
doc
    .fontSize(10)
    .fillColor("gray")
    .text(
        "This is a computer-generated investment statement from Cerulean Funds.",
        50,
        footerY,
        {
            width: 495,
            align: "center"
        }
    );

// ===========================
// Authorized Signature
// ===========================

const sigY = footerY + 45;

// Signature line
doc
    .moveTo(70, sigY)
    .lineTo(220, sigY)
    .stroke();

doc
    .fontSize(11)
    .fillColor("black")
    .text("Authorized Signature", 70, sigY + 8);

doc
    .fontSize(10)
    .fillColor("gray")
    .text("Cerulean Funds", 70, sigY + 24);

// ===========================
// Company Stamp
// ===========================

doc
    .dash(4, { space: 2 })
    .rect(360, sigY - 25, 140, 60)
    .stroke()
    .undash();

doc
    .fontSize(10)
    .fillColor("gray")
    .text("OFFICIAL COMPANY STAMP", 368, sigY - 2);

// ===========================
// Company Contact
// ===========================

doc
    .fontSize(10)
    .fillColor("#0057b8")
   const contactY = sigY + 40;

doc
    .fontSize(10)
    .fillColor("#0057b8")
    .text("Cerulean Funds", 0, contactY, {
        align: "center"
    });

doc
    .fontSize(9)
    .fillColor("black")
    .text(
        "Email: support@ceruleanfunds.com",
        0,
        contactY + 12,
        {
            align: "center"
        }
    );

doc.text(
    "Phone: +254 782 842 077",
    0,
    contactY + 24,
    {
        align: "center"
    }
);

doc.text(
    "https://cerulean-eyes-fund.onrender.com",
    0,
    contactY + 36,
    {
        align: "center"
    }
);

doc.end();

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});
module.exports = router;