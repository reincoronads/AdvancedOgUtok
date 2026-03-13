const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, billController.createBill);
router.get("/", authMiddleware, billController.getBills);
router.get("/archived", authMiddleware, billController.getArchivedBills);
router.get("/code/:code", billController.getBillByCode);
router.get("/:id", authMiddleware, billController.getBill);
router.put("/:id", authMiddleware, billController.editBill);
router.delete("/:id", authMiddleware, billController.deleteBill);
router.put("/:id/archive", authMiddleware, billController.archiveBill);
router.put("/:id/unarchive", authMiddleware, billController.unarchiveBill);
router.put("/:id/regenerate-code", authMiddleware, billController.regenerateCode);
router.post("/add-participant", authMiddleware, billController.addParticipant);
router.post("/remove-participant", authMiddleware, billController.removeParticipant);
router.post("/send-guest-invite", authMiddleware, billController.sendGuestInvite);

module.exports = router;