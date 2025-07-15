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
  project: zod.string(),
});

router.post("/add-transaction/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
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
      transaction: newTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

router.delete("/delete-transaction/:transactionId", async (req, res) => {
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

router.get("/get-all-transactions/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }
  try {
    const transactions = await Transaction.find({ project: projectId })
      .populate("addedBy", "name")
      .populate("paidBy", "name");
    return res.status(200).json({
      message: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

export default router;
