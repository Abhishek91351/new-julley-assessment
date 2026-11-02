
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Sun, Moon, Sparkles } from "lucide-react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";

function ThemeSwitcher({ theme, toggleTheme }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className="group fixed right-6 top-5 z-[9999] flex items-center gap-2 rounded-full border px-3 py-2.5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 group-hover:rotate-12"
        style={{
          background: "var(--accent-light)",
          color: "var(--accent)",
        }}
      >
        {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
      </span>

      <span className="pr-1 text-sm font-semibold">
        {theme === "light" ? "Dark mode" : "Light mode"}
      </span>
    </button>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("kanban-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("kanban-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  };

  return (
    <BrowserRouter>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <ThemeSwitcher
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <Routes>
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/board/:boardId" element={<Board />} />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


















// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Board from "./pages/Board";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />

//         <Route path="/login" element={<Login />} />

//         <Route path="/register" element={<Register />} />

//         <Route path="/dashboard" element={<Dashboard />} />

//         <Route path="/board/:boardId" element={<Board />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
