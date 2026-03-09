const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

// Helper to generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, nickname, email, username, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !nickname || !email || !username || !password || !confirmPassword) return res.status(400).json({ message: "All fields are required" });
    if (hasSpacesOnly(firstName) || hasSpacesOnly(lastName) || hasSpacesOnly(nickname) || hasSpacesOnly(username)) return res.status(400).json({ message: "Spaces are not valid input" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Please enter a valid email address" });
    if (!isValidPassword(password)) return res.status(400).json({ message: "Password must be 8-16 characters with at least one uppercase, one lowercase, one number, and one special character" });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) return res.status(400).json({ message: "Nickname already taken" });
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail && existingEmail.accountType !== "guest") return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a 6-digit verification code
    const verificationCode = generateCode();

    let newUser;
    if (existingEmail && existingEmail.accountType === "guest") {
      existingEmail.nickname = nickname;
      existingEmail.username = username;
      existingEmail.password = hashedPassword;
      existingEmail.accountType = "standard";
      existingEmail.firstName = firstName;
      existingEmail.lastName = lastName;
      existingEmail.isEmailVerified = false;
      existingEmail.emailVerificationToken = verificationCode;
      await existingEmail.save();
      newUser = existingEmail;
    } else {
      newUser = await User.create({
        firstName, lastName, nickname, email: email.toLowerCase(), username,
        password: hashedPassword, accountType: "standard", isEmailVerified: false,
        emailVerificationToken: verificationCode
      });
    }

    // Send Verification Code Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Your Verification Code - SplitBill",
      html: `<h2>Welcome to SplitBill!</h2>
             <p>Your 6-digit verification code is:</p>
             <h1 style="font-size: 36px; letter-spacing: 4px; color: #4F46E5;">${verificationCode}</h1>
             <p>Enter this code on the registration screen to verify your account.</p>`
    });

    res.status(201).json({ message: "Verification code sent to your email.", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY EMAIL (UPDATED FOR CODE)
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email is already verified" });
    if (user.emailVerificationToken !== code) return res.status(400).json({ message: "Invalid or incorrect verification code" });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email successfully verified!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESEND VERIFICATION CODE (NEW)
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email is already verified" });

    const newCode = generateCode();
    user.emailVerificationToken = newCode;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "New Verification Code - SplitBill",
      html: `<h2>Verification Code Resent</h2>
             <p>Your new 6-digit verification code is:</p>
             <h1 style="font-size: 36px; letter-spacing: 4px; color: #4F46E5;">${newCode}</h1>`
    });

    res.status(200).json({ message: "A new code has been sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REGISTER GUEST USER
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
    res.status(500).json({ message: error.message });
  }
};

// UPGRADE GUEST TO REGISTERED
exports.upgradeGuest = async (req, res) => {
  try {
    const { email, username, nickname, password, confirmPassword } = req.body;

    if (!email || !username || !nickname || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase(), accountType: "guest" });
    if (!user) return res.status(404).json({ message: "Guest user not found with this email" });

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase, one lowercase, one number, and one special character"
      });
    }
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) return res.status(400).json({ message: "Nickname already taken" });

    user.username = username;
    user.nickname = nickname;
    user.password = await bcrypt.hash(password, 10);
    user.accountType = "standard";
    user.isEmailVerified = true; // Assuming we trust the guest email here
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

    // Still checking if they verified their email from registration!
    if (user.isEmailVerified === false) {
      return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox." });
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

// VERIFY LOGIN OTP
exports.verifyLogin = async (req, res) => {
  try {
    const { username, code } = req.body;
    
    if (!username || !code) return res.status(400).json({ message: "Username and code are required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.emailVerificationToken !== code) {
      return res.status(400).json({ message: "Invalid or incorrect verification code" });
    }

    // Clear the token once used successfully
    user.emailVerificationToken = undefined;
    await user.save();

    // Generate JWT Token (Actually logging them in now)
    const token = jwt.sign(
      { id: user._id, username: user.username, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful!",
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

// RESEND LOGIN OTP
exports.resendLoginCode = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const newCode = generateCode();
    user.emailVerificationToken = newCode;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "New Login Verification Code - SplitBill",
      html: `<h2>New Login Attempt</h2>
             <p>Your new 6-digit login verification code is:</p>
             <h1 style="font-size: 36px; letter-spacing: 4px; color: #4F46E5;">${newCode}</h1>`
    });

    res.status(200).json({ message: "A new code has been sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD - send reset code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const resetCode = generateCode();
    user.resetPasswordToken = resetCode; 
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send Reset Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Code - SplitBill",
      html: `<h2>Password Reset Request</h2>
             <p>Your 6-digit password reset code is:</p>
             <h1 style="font-size: 36px; letter-spacing: 4px; color: #4F46E5;">${resetCode}</h1>
             <p>This code is valid for 1 hour. If you did not request this, please ignore this email.</p>`
    });

    res.status(200).json({
      message: "A 6-digit reset code has been sent to your email."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY RESET CODE
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email and code are required" });

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset code" });

    res.status(200).json({ message: "Code verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password, confirmPassword } = req.body;

    if (!email || !code || !password || !confirmPassword) return res.status(400).json({ message: "All fields are required" });
    
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase, one lowercase, one number, and one special character"
      });
    }
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset code" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken");
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
    const updated = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken");
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

// SEARCH USERS
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ message: "Search query must be at least 2 characters" });

    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { nickname: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } }
      ]
    }).select("firstName lastName email nickname username accountType").limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};