const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// REGISTER
router.post("/register", authController.registerUser);

// REGISTER GUEST
router.post("/register-guest", authMiddleware, authController.registerGuest);

// UPGRADE GUEST
router.post("/upgrade-guest", authController.upgradeGuest);

// LOGIN
router.post("/login", authController.loginUser);

// FORGOT PASSWORD
router.post("/forgot-password", authController.forgotPassword);

// RESET PASSWORD
router.post("/reset-password", authController.resetPassword);

// GET CURRENT USER
router.get("/me", authMiddleware, authController.getMe);

// UPDATE PROFILE
router.put("/profile", authMiddleware, authController.updateProfile);

// UPGRADE TO PREMIUM
router.put("/upgrade-premium", authMiddleware, authController.upgradeToPremium);

// SEARCH USERS
router.get("/search", authMiddleware, authController.searchUsers);

module.exports = router;