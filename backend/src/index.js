import express from "express";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/user.js";
import transactionRoutes from "./routes/transaction.js";
import cors from "cors";
import "dotenv/config";
import connectToDb from "./db/index.js";
import authMiddleware from "./middlewares/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDb();

app.use("/api/auth", authRoutes);
app.use("/api/project", authMiddleware, projectRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/transaction", authMiddleware, transactionRoutes);

app.get("/health-check", (req, res) => {
  res.status(200).json({
    message: "Server is up and running!!",
    time: new Date().toISOString(),
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
