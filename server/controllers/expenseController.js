const Expense = require("../models/Expense");
const Bill = require("../models/Bill");

// ADD EXPENSE
exports.addExpense = async (req, res) => {
  try {
    const { billId, expenseName, amount, paidBy, splitType, splitBetween } = req.body;

    if (!billId || !expenseName || !amount || !paidBy) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    let finalSplit = [];

    if (splitType === "equal") {
      const participants = bill.participants;
      const share = parseFloat((amount / participants.length).toFixed(2));
      finalSplit = participants.map(p => ({
        userId: p.userId,
        shareAmount: share
      }));
    }

    if (splitType === "custom") {
      if (!splitBetween || splitBetween.length === 0) {
        return res.status(400).json({ message: "Custom split data required" });
      }
      // For custom: divide equally among selected persons
      const share = parseFloat((amount / splitBetween.length).toFixed(2));
      finalSplit = splitBetween.map(item => ({
        userId: item.userId,
        shareAmount: share
      }));
    }

    const expense = await Expense.create({
      billId,
      expenseName,
      amount,
      paidBy,
      splitType: splitType || "equal",
      splitBetween: finalSplit
    });

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "firstName lastName nickname")
      .populate("splitBetween.userId", "firstName lastName nickname");

    res.status(201).json({ message: "Expense added successfully", expense: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EXPENSES FOR A BILL
exports.getExpenses = async (req, res) => {
  try {
    const { billId } = req.params;
    const expenses = await Expense.find({ billId })
      .populate("paidBy", "firstName lastName nickname")
      .populate("splitBetween.userId", "firstName lastName nickname")
      .sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE EXPENSE
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Check that the user is host of the bill
    const bill = await Bill.findById(expense.billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can delete expenses" });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};