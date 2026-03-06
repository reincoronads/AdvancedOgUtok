const Bill = require("../models/Bill");
const User = require("../models/User");

// Helper: generate invite code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Helper: check and reset monthly bill limit
const checkBillLimit = async (user) => {
  const now = new Date();
  const resetDate = new Date(user.billLimitResetDate || 0);
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    user.billsCreatedThisMonth = 0;
    user.billLimitResetDate = now;
    await user.save();
  }
};

// CREATE BILL
exports.createBill = async (req, res) => {
  try {
    const { billName } = req.body;
    if (!billName || !billName.trim()) {
      return res.status(400).json({ message: "Bill name is required" });
    }

    const user = await User.findById(req.user._id);

    // Standard users: max 5 bills/month
    if (user.accountType === "standard") {
      await checkBillLimit(user);
      if (user.billsCreatedThisMonth >= 5) {
        return res.status(403).json({ message: "Standard users can create max 5 bills per month. Upgrade to premium for unlimited!" });
      }
    }

    const inviteCode = generateCode();
    const bill = await Bill.create({
      billName: billName.trim(),
      hostId: req.user._id,
      inviteCode,
      participants: [{ userId: req.user._id, role: "host" }]
    });

    // Increment monthly count
    if (user.accountType === "standard") {
      user.billsCreatedThisMonth += 1;
      await user.save();
    }

    res.status(201).json({ message: "Bill created successfully", bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL BILLS (active) for current user
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({
      "participants.userId": req.user._id,
      status: "active"
    }).populate("hostId", "firstName lastName nickname").populate("participants.userId", "firstName lastName nickname email accountType").sort({ createdAt: -1 });

    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE BILL
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("hostId", "firstName lastName nickname")
      .populate("participants.userId", "firstName lastName nickname email accountType");
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BILL BY INVITE CODE (for guests)
exports.getBillByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const bill = await Bill.findOne({ inviteCode: code })
      .populate("hostId", "firstName lastName nickname")
      .populate("participants.userId", "firstName lastName nickname email accountType");
    if (!bill) return res.status(404).json({ message: "No bill found with this invitation code" });

    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT BILL
exports.editBill = async (req, res) => {
  try {
    const { billName } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can edit this bill" });
    }

    if (billName && billName.trim()) bill.billName = billName.trim();
    await bill.save();

    const updated = await Bill.findById(bill._id)
      .populate("hostId", "firstName lastName nickname")
      .populate("participants.userId", "firstName lastName nickname email accountType");

    res.status(200).json({ message: "Bill updated", bill: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE BILL
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can delete this bill" });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Bill deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ARCHIVE BILL
exports.archiveBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can archive this bill" });
    }

    bill.status = "archived";
    bill.archivedAt = new Date();
    await bill.save();

    res.status(200).json({ message: "Bill archived", bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNARCHIVE BILL
exports.unarchiveBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can unarchive this bill" });
    }

    bill.status = "active";
    bill.archivedAt = undefined;
    await bill.save();

    res.status(200).json({ message: "Bill restored", bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ARCHIVED BILLS
exports.getArchivedBills = async (req, res) => {
  try {
    const bills = await Bill.find({
      "participants.userId": req.user._id,
      status: "archived"
    }).populate("hostId", "firstName lastName nickname").populate("participants.userId", "firstName lastName nickname email accountType").sort({ archivedAt: -1 });

    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REGENERATE INVITE CODE
exports.regenerateCode = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can regenerate the invite code" });
    }

    bill.inviteCode = generateCode();
    await bill.save();

    res.status(200).json({ message: "Invite code regenerated", inviteCode: bill.inviteCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD PARTICIPANT
exports.addParticipant = async (req, res) => {
  try {
    const { billId, userId } = req.body;

    if (!billId || !userId) {
      return res.status(400).json({ message: "billId and userId are required" });
    }

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Check host permission
    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can add participants" });
    }

    // Check if already a participant
    const exists = bill.participants.some(p => p.userId.toString() === userId);
    if (exists) return res.status(400).json({ message: "User already added to this bill" });

    // Standard user: max 3 persons per bill (including host)
    const host = await User.findById(req.user._id);
    if (host.accountType === "standard" && bill.participants.length >= 3) {
      return res.status(403).json({ message: "Standard users can add max 3 persons per bill. Upgrade to premium!" });
    }

    const addedUser = await User.findById(userId);
    const role = addedUser && addedUser.accountType === "guest" ? "guest" : "member";

    bill.participants.push({ userId, role });
    await bill.save();

    const updated = await Bill.findById(bill._id)
      .populate("hostId", "firstName lastName nickname")
      .populate("participants.userId", "firstName lastName nickname email accountType");

    res.status(200).json({ message: "Participant added", bill: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE PARTICIPANT
exports.removeParticipant = async (req, res) => {
  try {
    const { billId, userId } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can remove participants" });
    }
    if (bill.hostId.toString() === userId) {
      return res.status(400).json({ message: "Cannot remove the host" });
    }

    bill.participants = bill.participants.filter(p => p.userId.toString() !== userId);
    await bill.save();

    res.status(200).json({ message: "Participant removed", bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};