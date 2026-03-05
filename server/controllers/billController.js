const Bill = require("../models/Bill");

// CREATE BILL
exports.createBill = async (req, res) => {
  try {
    const { billName } = req.body;

    if (!billName) {
      return res.status(400).json({ message: "Bill name is required" });
    }

    // Generate random invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const bill = await Bill.create({
      billName,
      hostId: req.user.id,
      inviteCode,
      participants: [
        { userId: req.user.id, role: "host" }
      ]
    });

    res.status(201).json({
      message: "Bill created successfully",
      bill
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD PARTICIPANT
exports.addParticipant = async (req, res) => {
  try {
    const { billId, userId, role } = req.body;

    // Validate
    if (!billId || !userId || !role) {
      return res.status(400).json({ message: "billId, userId, and role are required" });
    }

    // Find bill
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Check if already a participant
    const exists = bill.participants.some(p => p.userId.toString() === userId);
    if (exists) return res.status(400).json({ message: "User already added" });

    // Add participant
    bill.participants.push({ userId, role });
    await bill.save();

    res.status(200).json({ message: "Participant added successfully", bill });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};