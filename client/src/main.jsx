import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider>
      <App />
      <Toaster />
    </ThemeProvider>
  </Provider>
);
