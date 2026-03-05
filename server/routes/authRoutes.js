const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// REGISTER
router.post("/register", authController.registerUser);

// LOGIN
router.post("/login", authController.loginUser);

module.exports = router;