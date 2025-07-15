import { Router } from "express";
import Transaction from "../models/transaction.js";
import zod from "zod";

const router = Router();

const transactionSchema = zod.object({
  amount: zod.number().positive(),
  mode: zod.enum(["cash", "card", "upi"]),
  type: zod.enum(["incoming", "outgoing"]),
  description: zod.string().min(1).trim(),
  paidBy: zod.string(),
});

router.post("/create/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  console.log("Creating transaction for project:", projectId);
  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const validation = transactionSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid input data",
      error: JSON.parse(validation.error),
    });
  }

  try {
    const newTransaction = await Transaction.create({
      ...req.body,
      addedBy: req.headers.user?.id,
      project: projectId,
    });
    if (!newTransaction) {
      return res.status(401).json({ message: "Transaction not created" });
    }
    return res.status(201).json({
      message: "Transaction added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

router.delete("/delete/:transactionId", async (req, res) => {
  const transactionId = req.params.transactionId;
  if (!transactionId) {
    return res.status(400).json({ message: "Transaction ID is required" });
  }
  try {
    const transaction = await Transaction.deleteOne({ _id: transactionId });
    if (!transaction.deletedCount) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

export default router;
