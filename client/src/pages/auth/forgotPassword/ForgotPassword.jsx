import "./forgotPassword.scss";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader, Mail, ArrowLeft } from "lucide-react";
import FloatingShape from "../../../components/global/floatingShape/FloatingShape";
import { NavLink } from "react-router-dom";

// Languages
import Languages from "../languages/Languages";
import { useTranslation } from "react-i18next";

// RTKQ
import { useForgotPasswordMutation } from "../../../store/auth/authSlice";
import toast from "react-hot-toast";

function ForgotPassword() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // RTKQ
  const [forgotPassword, { isLoading, isError, error }] =
    useForgotPasswordMutation();

  // Handle Forgot-Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email).unwrap();
      setIsSubmitted(true);
      toast.success(`Completed 😍`);
    } catch (error) {
      console.error(error?.data?.message);
      toast.error(error?.data?.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <FloatingShape />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="forgot-password-card"
      >
        <div className="forgot-password-content">
          {/* Languages Component */}
          <Languages />

          <h2 className="forgot-password-title">{t("Forgot Password")}</h2>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <p className="forgot-password-instruction">
                {t(
                  "Enter your email address and we'll send you a link to reset your password."
                )}
              </p>
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
              {isError && (
                <p className="error-message">
                  {error?.data?.message || t("Failed to send reset link.")}
                </p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="forgot-password-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="loader-icon" />
                ) : (
                  t("Send Reset Link")
                )}
              </motion.button>
            </form>
          ) : (
            <div className="success-message">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="success-icon"
              >
                <Mail className="icon" />
              </motion.div>
              <p>
                {t(
                  "If an account exists for {email}, you will receive a password reset link shortly.",
                  {
                    email,
                  }
                )}
              </p>
            </div>
          )}
        </div>

        <div className="forgot-password-footer">
          <NavLink to={"/login"} className="back-to-login-link">
            <ArrowLeft className="icon" /> {t("Back to Login")}
          </NavLink>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
