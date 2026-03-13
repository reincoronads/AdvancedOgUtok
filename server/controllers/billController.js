const Bill = require("../models/Bill");
const User = require("../models/User");
const { sendGuestInviteEmail } = require("../utils/emailService");

// Helper: generate invite code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Helper: count bills created this month by a user
const countBillsThisMonth = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return Bill.countDocuments({
    hostId: userId,
    createdAt: { $gte: startOfMonth }
  });
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
      const billsThisMonth = await countBillsThisMonth(user._id);
      if (billsThisMonth >= 5) {
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
// Optional ?email= query param for guest identification and 6hr daily limit tracking
exports.getBillByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { email } = req.query;

    const bill = await Bill.findOne({ inviteCode: code })
      .populate("hostId", "firstName lastName nickname")
      .populate("participants.userId", "firstName lastName nickname email accountType");
    if (!bill) return res.status(404).json({ message: "No bill found with this invitation code" });

    // Guest identification and 6hr daily limit enforcement
    if (email) {
      const guest = await User.findOne({ email: email.toLowerCase(), accountType: "guest" });

      if (!guest) {
        return res.status(404).json({ message: "No guest account found with this email" });
      }

      // Verify this guest is a participant in the bill
      const isParticipant = bill.participants.some(
        p => p.userId && p.userId._id && p.userId._id.toString() === guest._id.toString()
      );
      if (!isParticipant) {
        return res.status(403).json({ message: "This email is not a participant on this bill" });
      }

      const now = new Date();
      const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      // Reset daily window if it's been more than 24h since last reset
      const needsReset = !guest.guestAccessResetDate ||
        (now - new Date(guest.guestAccessResetDate)) >= ONE_DAY_MS;

      if (needsReset) {
        guest.guestDailyAccessStart = now;
        guest.guestAccessResetDate = now;
        guest.guestAccessMinutesUsed = 0;
        await guest.save();
        return res.status(200).json({
          ...bill.toJSON(),
          guestAccess: { minutesRemaining: 360 }
        });
      }

      // Check if the 6-hour window from the start of today's access has elapsed
      if (guest.guestDailyAccessStart) {
        const elapsed = now - new Date(guest.guestDailyAccessStart);
        if (elapsed >= SIX_HOURS_MS) {
          return res.status(403).json({
            message: "Daily guest access limit reached (6 hours). You can access again tomorrow.",
            limitReached: true
          });
        }
        const minutesRemaining = Math.max(0, Math.round((SIX_HOURS_MS - elapsed) / 60000));
        return res.status(200).json({
          ...bill.toJSON(),
          guestAccess: { minutesRemaining }
        });
      }

      // First access of the day — set the start timestamp
      guest.guestDailyAccessStart = now;
      guest.guestAccessResetDate = now;
      await guest.save();
      return res.status(200).json({
        ...bill.toJSON(),
        guestAccess: { minutesRemaining: 360 }
      });
    }

    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEND GUEST INVITE EMAIL
exports.sendGuestInvite = async (req, res) => {
  try {
    const { billId, guestEmail } = req.body;
    if (!billId || !guestEmail) {
      return res.status(400).json({ message: "billId and guestEmail are required" });
    }

    const bill = await Bill.findById(billId).populate("hostId", "firstName lastName");
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.hostId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can send invites" });
    }

    const guest = await User.findOne({ email: guestEmail.toLowerCase() });
    if (!guest) return res.status(404).json({ message: "Guest user not found" });

    await sendGuestInviteEmail({
      guestEmail: guest.email,
      guestName: guest.firstName,
      billName: bill.billName,
      inviteCode: bill.inviteCode,
      hostName: `${bill.hostId.firstName} ${bill.hostId.lastName}`
    });

    res.status(200).json({ message: "Invitation email sent to guest!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email: " + error.message });
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

    // Standard user: max 3 persons per bill (including host and any guests)
    const host = await User.findById(req.user._id);
    if (host.accountType === "standard" && bill.participants.length >= 3) {
      return res.status(403).json({ message: "Standard users can have max 3 people per bill (including host & guests). Upgrade to premium!" });
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