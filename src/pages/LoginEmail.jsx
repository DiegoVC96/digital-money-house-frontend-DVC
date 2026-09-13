import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.includes("@")) {
      setError("Ingresá un email válido.");
      return;
    }

    navigate("/login/password", { state: { email } });
  }

  return (
    <main>
      <h1>Iniciar sesión</h1>
      <p>Ingresá tu email para continuar.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button>Continuar</button>
      </form>

      <p>
        ¿No tenés cuenta? <Link to="/register">Creá una</Link>
      </p>
    </main>
  );
}

export default LoginEmail;