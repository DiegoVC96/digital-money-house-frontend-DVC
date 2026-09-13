import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import LoginEmail from "./pages/LoginEmail";
import LoginPassword from "./pages/LoginPassword";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginEmail />} />
        <Route path="/login/password" element={<LoginPassword />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;