const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, nickname, email, username, password, confirmPassword } = req.body;

    // 1️⃣ Validate required fields
    if (!firstName || !lastName || !nickname || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 3️⃣ Check uniqueness
    const existingUser = await User.findOne({ $or: [{ username }, { nickname }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username, nickname, or email already exists" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const newUser = await User.create({
      firstName,
      lastName,
      nickname,
      email,
      username,
      password: hashedPassword,
      accountType: "guest", // default account type
      isEmailVerified: false
    });

    // 6️⃣ Send response
    res.status(201).json({ message: "Registration successful. Please check your email for verification." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Incorrect username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        accountType: user.accountType
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};