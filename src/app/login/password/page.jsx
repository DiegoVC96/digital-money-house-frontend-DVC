"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginUser } from "../../../services/authService";

export default function LoginPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem("loginEmail"));
  }, []);

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
      sessionStorage.removeItem("loginEmail");
      router.push("/home");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (email === null) {
    return null;
  }

  if (!email) {
    router.replace("/login");
    return null;
  }

  return (
    <main className="auth-page login-page">
      <header className="auth-header login-header">
        <Link className="brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>
      </header>

      <section className="login-content">
        <h1>Ingresá tu contraseña</h1>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button disabled={loading}>
            {loading ? "Ingresando..." : "Continuar"}
          </button>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>

      <footer className="auth-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}