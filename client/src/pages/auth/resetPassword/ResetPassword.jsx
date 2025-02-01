import "./resetPassword.scss";
import { useState } from "react";
import { motion } from "framer-motion";
import { useResetPasswordMutation } from "../../../store/auth/authSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Loader } from "lucide-react";

// Languages
import Languages from "../languages/Languages";
import { useTranslation } from "react-i18next";

// RTKQ
import FloatingShape from "../../../components/global/floatingShape/FloatingShape";
import toast from "react-hot-toast";

function ResetPassword() {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  // RTKQ
  const [resetPassword, { isLoading, isError, error }] =
    useResetPasswordMutation();

  // Handle Reset
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("Passwords do not match"));
      return;
    }

    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      toast.success(
        t("Password reset successfully, redirecting to login page...")
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err?.data?.message || t("Error resetting password"));
    }
  };

  return (
    <div className="reset-password-page">
      <FloatingShape />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="reset-password-card"
      >
        <div className="reset-password-content">
          {/* Languages */}
          <Languages />

          <h2 className="reset-password-title">{t("Reset Password")}</h2>
          {isError && (
            <p className="error-message">
              {error?.data?.message || t("Error resetting password.")}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Lock className="icon" />
              <input
                type="password"
                placeholder={t("New Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Lock className="icon" />
              <input
                type="password"
                placeholder={t("Confirm New Password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="reset-password-button"
            >
              {isLoading ? (
                <Loader className="loader-icon" />
              ) : (
                t("Set New Password")
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
