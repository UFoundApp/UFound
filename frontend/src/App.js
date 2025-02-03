import './App.css';
import AuthPage from "./components/AuthPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Home from "./components/home";


function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </Router>
  );
}

export default App;

