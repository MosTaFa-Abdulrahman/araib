import "./register.scss";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FloatingShape from "../../../components/global/floatingShape/FloatingShape";
import PasswordStrengthMeter from "../../../components/global/passwordCriteria/PasswordCriteria";

// RTKQ + Languages
import { useRegisterUserMutation } from "../../../store/auth/authSlice";
import toast from "react-hot-toast";
import Languages from "../languages/Languages";

function Register() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [registerUser, { isLoading, isError, error }] =
    useRegisterUserMutation();

  // Validate Password
  const isPasswordValid = () => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isPasswordValid()) {
      toast.error(
        t("Please complete the password requirements before signing up.")
      );
      return;
    }

    try {
      const result = await registerUser({ username, email, password }).unwrap();
      navigate("/verify-email");
      toast.success(
        `${t("Registered successfully!")} ${result?.user?.username}`
      );
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

        <h2 className="register-title">{t("Create Account")}</h2>
        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <User className="icon" />
            <input
              type="text"
              placeholder={t("Username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
            {isLoading ? <Loader className="spinner" /> : t("Sign Up")}
          </motion.button>
        </form>
        <p className="register-footer">
          {t("Already have an account?")}{" "}
          <Link to="/login" className="login-link">
            {t("Login")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
