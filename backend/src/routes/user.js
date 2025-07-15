import { Router } from "express";
import User from "../models/user.js";
import Project from "../models/project.js";

const router = Router();

router.get("/get-all-projects", async (req, res) => {
  try {
    const userId = req.headers.user?.id;
    const ownProjects = await Project.find({ createdBy: userId });
    const memberProjects = await Project.find({ members: userId });
    return res.status(200).json({
      ownedProjects: ownProjects,
      memberProjects: memberProjects,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

export default router;
