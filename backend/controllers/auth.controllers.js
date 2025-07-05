
import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// 🔥 Utility: Detect if running on production (Render uses HTTPS)
const isProduction = process.env.NODE_ENV === "production";

// ✅ Sign Up Controller
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = await genToken(user._id);

    // ✅ Set cookie properly for both dev and prod
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,         // true only in production
      sameSite: isProduction ? "None" : "Lax", // "None" for cross-origin, "Lax" for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("❌ SignUp Error:", error.message);
    return res.status(500).json({ message: `Sign up error: ${error.message}` });
  }
};

// ✅ Login Controller
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const token = await genToken(user._id);

    // ✅ Same cookie logic here too
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    return res.status(500).json({ message: `Login error: ${error.message}` });
  }
};

// ✅ Logout Controller
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax"
    });

    return res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("❌ Logout Error:", error.message);
    return res.status(500).json({ message: `Logout error: ${error.message}` });
  }
};
