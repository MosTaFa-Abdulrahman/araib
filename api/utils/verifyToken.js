const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token provided 😌",
      });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SEC);

      if (!decoded)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized - invalid token 😥" });

      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.log("Error in verifyToken ", error);
      return res
        .status(500)
        .json({ success: false, message: "Server error 😴" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { verifyToken };
