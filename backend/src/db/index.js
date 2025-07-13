import mongoose from "mongoose";

async function connectToDb() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("[db] Connected to the database successfully");
  } catch (error) {
    console.error("[db] Error connecting to the database:", error);
    throw new Error(error);
  }
}

export default connectToDb;
