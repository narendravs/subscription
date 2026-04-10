import "./App.css";
import Login from "./layout/Login";
import Home from "./layout/Home";
import Cancel from "./layout/Cancel";
import Register from "./layout/Register";
import Success from "./layout/Success";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgotPassword from "./layout/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/success" element={<Success />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
