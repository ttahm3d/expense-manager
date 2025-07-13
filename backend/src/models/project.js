import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
});

export default mongoose.model("Project", projectSchema);
