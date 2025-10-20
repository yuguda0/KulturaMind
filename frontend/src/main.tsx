import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize dark mode by default
const initializeDarkMode = () => {
  const html = document.documentElement;
  const isDarkMode = localStorage.getItem('theme') === 'dark' ||
                     (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDarkMode) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

initializeDarkMode();

createRoot(document.getElementById("root")!).render(<App />);
