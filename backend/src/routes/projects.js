/**
 * User can create a Project
 * Add New Users to project
 * Edit Project name
 * Delete Project
 * View all Projects
 * View all Users in a Project
 */
import { Router } from "express";
import Project from "../models/project.js";
import zod from "zod";

const projectSchema = zod.object({
  name: zod.string().min(2).trim(),
  description: zod.string().trim().optional(),
});

const router = Router();

router.post("/create", async (req, res) => {
  const validation = projectSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid inputs",
      error: JSON.parse(validation.error),
    });
  }
  try {
    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.headers.user?.id,
    });
    await project.save();
    return res.status(201).json({
      message: "Project created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

router.patch("/add-member/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const newUserId = req.body.userId;
  if (!projectId) {
    return res
      .status(400)
      .json({ message: "Please pass projectId query parameter." });
  }

  if (!newUserId) {
    return res
      .status(400)
      .json({ message: "Please pass userId in request body" });
  }

  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: { members: newUserId },
      },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({
      message: "User added to project successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

router.patch("/edit/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const { name = "", description = "" } = req.body;
  if (!projectId) {
    return res.status(401).json({
      message: "Please pass projectId in request params",
    });
  }

  try {
    const project = await Project.findByIdAndUpdate(
      {
        _id: projectId,
        createdBy: req.headers.user?.id,
      },
      {
        name,
        description,
      },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

router.delete("/delete/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  if (!projectId) {
    return res.status(400).json({
      message: "Please pass projectId in request params",
    });
  }
  try {
    const project = await Project.findOneAndDelete({
      _id: projectId,
      createdBy: req.headers.user?.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: JSON.stringify(error),
    });
  }
});

export default router;
