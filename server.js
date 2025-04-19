import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Serve Angular frontend
app.use(express.static(path.join(__dirname, "frontend", "dist", "your-angular-app")));

// Catch all route for Angular routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "your-angular-app", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
