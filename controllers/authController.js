const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register User
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      nationalId,
      password,
      confirmPassword,
    } = req.body;

    // Check passwords
    if (password !== confirmPassword) {
      return res.send("Passwords do not match.");
    }

    // Check existing email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send("Email already exists.");
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      fullName,
      email,
      phone,
      nationalId,
      password: hashedPassword,
    });

    await user.save();

    res.send("✅ Account created successfully!");

  } catch (err) {
    console.log(err);
    res.send("Registration failed.");
  }
};