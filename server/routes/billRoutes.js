const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const authMiddleware = require("../middleware/authMiddleware");

// Create bill (protected)
router.post("/create", authMiddleware, billController.createBill);

// Add participant to a bill
router.post("/add-participant", authMiddleware, billController.addParticipant);

module.exports = router;