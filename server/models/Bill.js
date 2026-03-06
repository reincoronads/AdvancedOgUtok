const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  billName: { type: String, required: true, trim: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  inviteCode: { type: String, required: true, unique: true },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["host", "member", "guest"], default: "member" }
    }
  ],
  status: { type: String, enum: ["active", "archived"], default: "active" },
  archivedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);