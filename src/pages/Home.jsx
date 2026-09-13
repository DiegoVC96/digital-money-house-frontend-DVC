import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

function Home() {
  const navigate = useNavigate();

  async function handleLogout() {
    const token = localStorage.getItem("token");

    try {
      await logoutUser(token);
    } catch {
      // Aunque el backend falle, la sesión local debe cerrarse.
    } finally {
      localStorage.removeItem("token");
      navigate("/");
    }
  }

  return (
    <main>
      <h1>Bienvenido a Digital Money House</h1>
      <p>Tu sesión está iniciada.</p>

      <button onClick={handleLogout}>Cerrar sesión</button>
    </main>
  );
}

export default Home;