import "./login.scss";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FloatingShape from "../../../components/global/floatingShape/FloatingShape";
import PasswordStrengthMeter from "../../../components/global/passwordCriteria/PasswordCriteria";

// Languages
import Languages from "../languages/Languages";
import { useTranslation } from "react-i18next";

// RTKQ
import { useLoginUserMutation } from "../../../store/auth/authSlice";
import toast from "react-hot-toast";

function Login() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // RTKQ
  const [loginUser, { isLoading, isError, error }] = useLoginUserMutation();

  // Validate Passowrd
  const isPasswordValid = () => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isPasswordValid()) {
      toast.error(
        "Please complete the password requirements before signing up."
      );
      return;
    }

    try {
      const result = await loginUser({
        email,
        password,
      }).unwrap();
      navigate("/");
      toast.success(`Welcome Back ${result?.user?.username} 😍`);
    } catch (error) {
      console.error(error?.data?.message);
      toast.error(error?.data?.message);
    }
  };

  return (
    <div className="register-page">
      <FloatingShape />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="register-card"
      >
        {/* Languages Component */}
        <Languages />

        <h2 className="register-title">{t("Welcome Back")}</h2>
        <form onSubmit={handleLogin} className="register-form">
          <div className="input-group">
            <Mail className="icon" />
            <input
              type="email"
              placeholder={t("Email Address")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <Lock className="icon" />
            <input
              type="password"
              placeholder={t("Password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <PasswordStrengthMeter password={password} />
          {isError && (
            <p className="error-message">
              {error?.data?.message ||
                t("An error occurred during registration.")}
            </p>
          )}

          <motion.button
            className="register-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!isPasswordValid() || isLoading}
          >
            {isLoading ? <Loader className="spinner" /> : t("Sign In")}
          </motion.button>
        </form>

        <p className="register-footer">
          <Link
            to="/forgot-password"
            style={{
              color: "rgb(249, 56, 56)",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            {t("Forgot Password?")}
          </Link>
        </p>
        <p className="register-footer">
          {t("Don't have an account?")}{" "}
          <Link to="/register" className="login-link">
            {t("Register")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
