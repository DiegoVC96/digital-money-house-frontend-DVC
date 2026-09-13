import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function LoginPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <main>
        <p>Primero ingresá tu email.</p>
        <Link to="/login">Volver al login</Link>
      </main>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!password) {
      setError("Ingresá tu contraseña.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({ email, password });

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Ingresá tu contraseña</h1>
      <p>{email}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <Link to="/login">Usar otro email</Link>
    </main>
  );
}

export default LoginPassword;