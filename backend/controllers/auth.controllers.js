// import genToken from "../config/token.js"
// import User from "../models/user.model.js"
// import bcrypt from "bcryptjs"
// export const signUp=async (req,res)=>{
// try {
//     const {name,email,password}=req.body

//     const existEmail=await User.findOne({email})
//     if(existEmail){
//         return res.status(400).json({message:"email already exists !"})
//     }
//     if(password.length<6){
//         return res.status(400).json({message:"password must be at least 6 characters !"})
//     }

//     const hashedPassword=await bcrypt.hash(password,10)

//     const user=await User.create({
//         name,password:hashedPassword,email
//     })

//     const token=await genToken(user._id)

//     res.cookie("token",token,{
//         httpOnly:true,
//        maxAge:7*24*60*60*1000,
//        sameSite:"strict",
//        secure:false
//     })

//     return res.status(201).json(user)

// } catch (error) {
//        return res.status(500).json({message:`sign up error ${error}`})
// }
// }

// export const Login=async (req,res)=>{
// try {
//     const {email,password}=req.body

//     const user=await User.findOne({email})
//     if(!user){
//         return res.status(400).json({message:"email does not exists !"})
//     }
//    const isMatch=await bcrypt.compare(password,user.password)

//    if(!isMatch){
//    return res.status(400).json({message:"incorrect password"})
//    }

//     const token=await genToken(user._id)

//     res.cookie("token",token,{
//         httpOnly:true,
//        maxAge:7*24*60*60*1000,
//        sameSite:"strict",
//        secure:false
//     })

//     return res.status(200).json(user)

// } catch (error) {
//        return res.status(500).json({message:`login error ${error}`})
// }
// }

// export const logOut=async (req,res)=>{
//     try {
//         res.clearCookie("token")
//          return res.status(200).json({message:"log out successfully"})
//     } catch (error) {
//          return res.status(500).json({message:`logout error ${error}`})
//     }
// }
        










import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ✅ Sign Up Controller
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate JWT
    const token = await genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
      secure: false // set to true if using HTTPS
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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist!" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    // Generate JWT
    const token = await genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
      secure: false // set to true if using HTTPS
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
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("❌ Logout Error:", error.message);
    return res.status(500).json({ message: `Logout error: ${error.message}` });
  }
};


