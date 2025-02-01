const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const {
  generateTokenAndSetCookie,
} = require("../utils/generateTokenAndSetCookie");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} = require("../mailtrap/emails");
const { verifyToken } = require("../utils/verifyToken");

// Register
router.post("/register", async (req, res) => {
  try {
    // Check User
    const { email, username } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists 🙄🧐" });
    } else {
      // Hash Password
      const salt = bcrypt.genSalt(10);
      const hashPassword = bcrypt.hashSync(req.body.password, parseInt(salt));

      // Verifiction
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Save User
      const newUser = new User({
        username,
        email,
        password: hashPassword,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });
      await newUser.save();

      if (newUser) {
        // JWT
        generateTokenAndSetCookie(newUser._id, res);

        // Send Verifiction Code For Email
        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(200).json({
          success: true,
          message: "User Created Successfully 😍",
          user: {
            ...newUser._doc,
            password: undefined,
          },
        });
      } else
        res
          .status(400)
          .json({ success: false, message: "Invalid user data 😥" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify Email
router.post("/verify-email", async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code 🙄",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.username);

    res.status(200).json({
      success: true,
      message: "Email verified successfully 😛",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found 🙄" });
    } else {
      const validatePassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!validatePassword) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Password 🙄" });
      } else {
        generateTokenAndSetCookie(user._id, res);

        user.lastLoginDate = new Date();
        await user.save();

        res.status(200).json({
          success: true,
          message: "Logged in successfully 😊",
          user: {
            ...user._doc,
            password: undefined,
          },
        });
      }
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("access_token");
    res
      .status(200)
      .json({ success: true, message: "User logged out successfully 😍" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found 😥" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token 🙄",
      });
    }

    // update password
    const hashedPassword = bcrypt.hashSync(req.body.password, parseInt(10));
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful 😍" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check Auth
router.get("/check-auth", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found 😌" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
