const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

// Express Usages
dotenv.config();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  // origin: "http://localhost:5173",
  origin: "https://araib-group.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies
};
app.use(cors(corsOptions));

// Database Config
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Work 😍"))
  .catch((err) => console.log(`Error ${err.message}`));

// MiddleWares
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT} 🥰`));
