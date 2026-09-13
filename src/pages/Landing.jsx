import { Link } from "react-router-dom";

function Landing() {
  return (
    <main>
      <h1>Digital Money House</h1>

      <p>
        Gestioná tu dinero de forma simple: transferí, pagá servicios y
        administrá tu billetera desde cualquier dispositivo.
      </p>

      <Link to="/register">Crear cuenta</Link>
      {" | "}
      <Link to="/login">Iniciar sesión</Link>
    </main>
  );
}

export default Landing;