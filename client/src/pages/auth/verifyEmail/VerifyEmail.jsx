import "./verifyEmail.scss";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import FloatingShape from "../../../components/global/floatingShape/FloatingShape";

// Languages
import Languages from "../languages/Languages";
import { useTranslation } from "react-i18next";

// RTKQ
import { useVerifyEmailMutation } from "../../../store/auth/authSlice";
import toast from "react-hot-toast";

function VerifyEmail() {
  const { t } = useTranslation();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const [verifyEmail, { isLoading, isError, error }] = useVerifyEmailMutation();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    try {
      await verifyEmail(verificationCode).unwrap();
      toast.success("Email verified successfully!");
      navigate("/");
    } catch (error) {
      console.error(error?.data?.message || "An unexpected error occurred.");
      toast.error(error?.data?.message || "Invalid verification code.");
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="verify-email-page">
      <FloatingShape />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="verify-email-card"
      >
        {/* Languages */}
        <Languages />

        <h2 className="verify-email-title">{t("Verify Your Email")}</h2>
        <p className="verify-email-instruction">
          {t("Enter the 6-digit code sent to your email address.")}
        </p>
        <form onSubmit={handleSubmit} className="verify-email-form">
          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`code-input ${isError ? "code-input-error" : ""}`}
              />
            ))}
          </div>

          {isError && (
            <p className="error-message">
              {error?.data?.message ||
                t("Invalid verification code. Please try again.")}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={code.some((digit) => !digit) || isLoading}
            className="verify-email-button"
          >
            {isLoading ? <Loader className="loader-icon" /> : t("Verify Email")}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
