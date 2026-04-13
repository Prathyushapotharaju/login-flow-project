import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 5000;
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://root:example@localhost:27017/loginDB?authSource=admin')
 .then(() => console.log("Connected to MongoDB"))
 .catch(err => console.error("MongoDB connection error:", err));

// User schema with OTP fields for MFA
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date }
});

const User = mongoose.model('User', userSchema);

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = new User({ email, password });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Step 1: Login returns OTP
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    console.log(`OTP for ${email}: ${otp}`);

    return res.json({
      message: "OTP sent. Check backend terminal.",
      mfaRequired: true,
      email: email
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

// Step 2: Verify the OTP
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (user.otp!== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(401).json({ message: "OTP expired" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ message: "MFA successful. Login complete." });
  } catch (err) {
    res.status(500).json({ message: "Verification error" });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});