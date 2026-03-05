const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    required: true
  },
  expenseName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  splitType: {
    type: String,
    enum: ["equal", "custom"],
    default: "equal"
  },
  splitBetween: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      shareAmount: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);