import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createHR = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ role: "HR" });

    if (existing) {
      console.log("HR already exists");
      process.exit();
    }

    //----- enter password here -----
    const hashed = await bcrypt.hash("enter_password", 10);

    const hr = await User.create({
      name: "enter_full_name",
      email: "enter_email_address",
      password: hashed,
      role: "HR"
    });

    console.log("HR created:", hr.email);
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createHR();