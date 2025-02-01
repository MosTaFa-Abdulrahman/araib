const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SEC, { expiresIn: "15d" });

  res.cookie("access_token", token, {
    httpOnly: true, // more secure
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "None", // CSRFx
    // secure: process.env.NODE_ENV !== "development",
    secure: true, // Ensure cookies are sent over HTTPS
  });

  return token;
};

module.exports = { generateTokenAndSetCookie };
