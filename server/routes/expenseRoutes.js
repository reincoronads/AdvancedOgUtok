const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, expenseController.addExpense);
router.get("/bill/:billId", authMiddleware, expenseController.getExpenses);
router.delete("/:id", authMiddleware, expenseController.deleteExpense);

module.exports = router;