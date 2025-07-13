import express from "express";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import "dotenv/config";
import connectToDb from "./db/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDb();

app.use("/api/auth", authRoutes);

app.get("/health-check", (req, res) => {
  res.status(200).json({
    message: "Server is up and running!!",
    time: new Date().toISOString(),
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
