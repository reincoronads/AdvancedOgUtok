const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String
  },
  accountType: {
    type: String,
    enum: ["guest", "standard", "premium"],
    default: "standard"
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // For tracking Standard user bill creation limits (5/month)
  billsCreatedThisMonth: {
    type: Number,
    default: 0
  },
  billLimitResetDate: {
    type: Date,
    default: Date.now
  },
  // For guest access time tracking (6hrs/day)
  guestDailyAccessStart: {
    type: Date
  },
  guestAccessMinutesUsed: {
    type: Number,
    default: 0
  },
  guestAccessResetDate: {
    type: Date
  },
  // For password reset
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);