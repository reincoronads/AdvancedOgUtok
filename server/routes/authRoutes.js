const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.registerUser);

// --- UPDATED EMAIL ROUTES ---
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
// ----------------------------

router.post("/register-guest", authMiddleware, authController.registerGuest);
router.post("/upgrade-guest", authController.upgradeGuest);
router.post("/login", authController.loginUser);
router.post("/verify-login", authController.verifyLogin);
router.post("/resend-login-code", authController.resendLoginCode);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-code", authController.verifyResetCode);
router.post("/reset-password", authController.resetPassword);
router.get("/me", authMiddleware, authController.getMe);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/upgrade-premium", authMiddleware, authController.upgradeToPremium);
router.get("/search", authMiddleware, authController.searchUsers);

module.exports = router;