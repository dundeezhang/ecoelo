import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./css/index.css";
import "./css/App.css";
import "./css/Nav.css";
import "./css/Recipt.css";
import "./css/Dashboard.css";
import "./css/Activity.css";

import App from "./pages/App";
import Dashboard from "./pages/Dashboard";
import Three from "./pages/Three";
import ReceiptUpload from "./pages/components/ReciptUpload";
import Login from "./pages/components/Login";
import Verify from "./pages/components/Verify";
import Activity from "./pages/components/Activity";
import Logout from "./pages/components/Logout";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/3" element={<Three />} />
        <Route path="/receipt" element={<ReceiptUpload />} />
        <Route path="/login" element={<Login />} />
        <Route path="/magic-login" element={<Verify />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  </StrictMode>,
);
