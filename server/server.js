const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const billRoutes = require("./routes/billRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

// Middleware
const app = express();

// Allow requests from React frontend
app.use(cors({
  origin: "http://localhost:3000", // React dev server
  credentials: true
}));

// Routes
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/expenses", expenseRoutes);

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

// Server
app.listen(5000, () =>
  console.log("Server running on port 5000")
);