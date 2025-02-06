import "./themeToggle.scss";
import { motion } from "framer-motion";
import { Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const themes = [
    { id: "theme-purple", icon: <Palette size={18} />, label: "Purple" },
    { id: "theme-green", icon: <Sun size={18} />, label: "Green" },
    { id: "theme-dark", icon: <Moon size={18} />, label: "Dark" },
  ];

  return (
    <div className="theme-toggle">
      <div className="theme-options">
        {themes.map((t) => (
          <motion.button
            key={t.id}
            className={`theme-button ${theme === t.id ? "active" : ""}`}
            onClick={() => toggleTheme(t.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={t.label}
          >
            {t.icon}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default ThemeToggle;
