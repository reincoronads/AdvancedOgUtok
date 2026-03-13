const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Validation helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hasSpacesOnly = (val) => !val || val.trim().length === 0;
const isValidPassword = (pw) => {
  if (pw.length < 8 || pw.length > 16) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  if (!/[^A-Za-z0-9]/.test(pw)) return false;
  return true;
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, nickname, email, username, password, confirmPassword } = req.body;

    // Required fields
    if (!firstName || !lastName || !nickname || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Spaces-only check
    if (hasSpacesOnly(firstName) || hasSpacesOnly(lastName) || hasSpacesOnly(nickname) || hasSpacesOnly(username)) {
      return res.status(400).json({ message: "Spaces are not valid input" });
    }

    // Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Password validation
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase, one lowercase, one number, and one special character"
      });
    }

    // Confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check uniqueness
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      return res.status(400).json({ message: "Nickname already taken" });
    }
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail && existingEmail.accountType !== "guest") {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    // If a guest user with this email exists, upgrade them
    if (existingEmail && existingEmail.accountType === "guest") {
      existingEmail.nickname = nickname;
      existingEmail.username = username;
      existingEmail.password = hashedPassword;
      existingEmail.accountType = "standard";
      existingEmail.firstName = firstName;
      existingEmail.lastName = lastName;
      await existingEmail.save();
      newUser = existingEmail;
    } else {
      newUser = await User.create({
        firstName,
        lastName,
        nickname,
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        accountType: "standard",
        isEmailVerified: false
      });
    }

    res.status(201).json({
      message: "Registration successful! Welcome to SplitBill. Please check your email for verification. Click here to login.",
      userId: newUser._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REGISTER GUEST USER (invited or added to a bill)
exports.registerGuest = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "First name, last name, and email are required" });
    }
    if (hasSpacesOnly(firstName) || hasSpacesOnly(lastName)) {
      return res.status(400).json({ message: "Spaces are not valid input" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(200).json({ message: "User already exists", user: { id: existing._id, firstName: existing.firstName, lastName: existing.lastName, email: existing.email, accountType: existing.accountType } });
    }

    const guest = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      accountType: "guest"
    });

    res.status(201).json({
      message: "Guest user created",
      user: { id: guest._id, firstName: guest.firstName, lastName: guest.lastName, email: guest.email, accountType: guest.accountType }
    });
  } catch (error) {
    console.error("registerGuest error:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPGRADE GUEST TO REGISTERED (only needs password + username + nickname)
exports.upgradeGuest = async (req, res) => {
  try {
    const { email, username, nickname, password, confirmPassword } = req.body;

    if (!email || !username || !nickname || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase(), accountType: "guest" });
    if (!user) {
      return res.status(404).json({ message: "Guest user not found with this email" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase, one lowercase, one number, and one special character"
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) return res.status(400).json({ message: "Nickname already taken" });

    user.username = username;
    user.nickname = nickname;
    user.password = await bcrypt.hash(password, 10);
    user.accountType = "standard";
    await user.save();

    res.status(200).json({ message: "Account upgraded successfully! You can now login." });
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
    if (!user.password) {
      return res.status(400).json({ message: "This account requires upgrade. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect username or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, accountType: user.accountType },
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
        nickname: user.nickname,
        email: user.email,
        username: user.username,
        accountType: user.accountType
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD - send reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production, send this via email. For now, return the token.
    res.status(200).json({
      message: "Password reset token generated. Use it to reset your password.",
      resetToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase, one lowercase, one number, and one special character"
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT USER (profile)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, nickname } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName && !hasSpacesOnly(firstName)) user.firstName = firstName;
    if (lastName && !hasSpacesOnly(lastName)) user.lastName = lastName;
    if (nickname && !hasSpacesOnly(nickname)) {
      const existing = await User.findOne({ nickname, _id: { $ne: user._id } });
      if (existing) return res.status(400).json({ message: "Nickname already taken" });
      user.nickname = nickname;
    }

    await user.save();
    const updated = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpires");
    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPGRADE TO PREMIUM
exports.upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.accountType === "premium") return res.status(400).json({ message: "Already a premium user" });
    if (user.accountType === "guest") return res.status(400).json({ message: "Guest users must register first" });

    user.accountType = "premium";
    await user.save();

    res.status(200).json({ message: "Upgraded to premium!", accountType: user.accountType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH USERS (for adding to bills)
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    let users;
    const baseFilter = { _id: { $ne: req.user._id }, accountType: { $ne: "guest" } };
    if (!q || q.trim().length < 2) {
      // No query: return recent users (excluding the requester and guests)
      users = await User.find(baseFilter)
        .select("firstName lastName email nickname username accountType")
        .sort({ createdAt: -1 })
        .limit(10);
    } else {
      users = await User.find({
        ...baseFilter,
        $or: [
          { firstName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { nickname: { $regex: q, $options: "i" } },
          { username: { $regex: q, $options: "i" } }
        ]
      }).select("firstName lastName email nickname username accountType").limit(10);
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};