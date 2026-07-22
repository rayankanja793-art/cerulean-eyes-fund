const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./models/Admin");

mongoose.connect("mongodb://127.0.0.1:27017/ceruleanfunds")
.then(async () => {

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new Admin({

        username: "admin",
        password: hashedPassword,
        role: "Admin"

    });

    await admin.save();

    console.log("✅ Admin created successfully.");

    mongoose.connection.close();

})
.catch(err => console.log(err));