import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const normalisedUsername = username.trim();
    const normalisedEmail = email.toLowerCase().trim();

    const findDuplicateUser = await userModel.findOne({
      $or: [{ username: normalisedUsername }, { email: normalisedEmail }],
    });

    if (findDuplicateUser) {
      return res.status(400).json({
        success: false,
        message: "Username or Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await userModel.create({
      username: normalisedUsername,
      email: normalisedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        username: createUser.username,
        email: createUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
