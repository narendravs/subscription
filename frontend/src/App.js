import "./App.css";
import Login from "../src/layout/Login";
import Home from "./layout/Home";
import Cancel from "./layout/Cancel";
import Register from "./layout/Register";
import Success from "./layout/Success";
import Anonymous from "./layout/Anonymous";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/success" element={<Success />} />
        <Route path="/anonymous" element={<Anonymous />} />
      </Routes>
    </Router>
  );
}

export default App;
