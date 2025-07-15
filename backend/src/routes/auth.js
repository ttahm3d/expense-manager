import { Router } from "express";
import User from "../models/user.js";
import zod from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signInSchema = zod.object({
  email: zod.email(),
  password: zod.string().min(6),
});

const signUpSchema = zod.object({
  name: zod.string().min(2).trim(),
  email: zod.email().trim(),
  password: zod.string().min(6),
});
const router = Router();

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const validation = signInSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid input data",
      error: JSON.parse(validation?.error),
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Please enter the correct password" });
    }

    const token = await jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Signin Successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const validation = signUpSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: "Invalid input data",
      error: JSON.parse(validation.error),
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.PASSWORD_SALT_ROUNDS)
    );
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id, name }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res
      .status(201)
      .json({ message: "User created successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Signout successful" });
});

export default router;
