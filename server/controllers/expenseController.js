const Expense = require("../models/Expense");
const Bill = require("../models/Bill");

exports.addExpense = async (req, res) => {
  try {
    const { billId, expenseName, amount, paidBy, splitType, splitBetween } = req.body;

    if (!billId || !expenseName || !amount || !paidBy) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    let finalSplit = [];

    // ✅ Equal Split
    if (splitType === "equal") {
      const participants = bill.participants;
      const share = amount / participants.length;

      finalSplit = participants.map(p => ({
        userId: p.userId,
        shareAmount: share
      }));
    }

    // ✅ Custom Split
    if (splitType === "custom") {
      if (!splitBetween || splitBetween.length === 0) {
        return res.status(400).json({ message: "Custom split data required" });
      }

      const totalCustom = splitBetween.reduce((sum, item) => sum + item.shareAmount, 0);
      if (totalCustom !== amount) {
        return res.status(400).json({ message: "Custom split total must equal expense amount" });
      }

      finalSplit = splitBetween;
    }

    const expense = await Expense.create({
      billId,
      expenseName,
      amount,
      paidBy,
      splitType,
      splitBetween: finalSplit
    });

    res.status(201).json({ message: "Expense added successfully", expense });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};