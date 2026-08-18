const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const app = express();
const leadRoutes = require("./routes/leadRoutes");

const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API is running",
  });
});

// Health check
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "CRM API is running",
//   });
// });

connectDB();
// Start server
app.listen(PORT, () => {
  console.log(`CRM server running on http://localhost:${PORT}`);
});