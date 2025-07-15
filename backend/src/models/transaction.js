import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  mode: {
    type: String,
    enum: ["cash", "card", "upi"],
    required: true,
  },
  type: {
    type: String,
    enum: ["incoming", "outgoing"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async function (userId) {
        if (!this.project) return false;
        const project = await mongoose.model("Project").findById(this.project);
        return (
          project.members.includes(userId) ||
          project.createdBy.toString() === userId.toString()
        );
      },
      message: "User must be a member of the project",
    },
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

export default mongoose.model("Transaction", transactionSchema);
