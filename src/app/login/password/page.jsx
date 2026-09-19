"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPasswordPage() {
  const router = useRouter();
  const {
    pendingEmail,
    isAuthenticated,
    startSession,
    clearPendingEmail,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    if (!pendingEmail) {
      router.replace("/login");
    }
  }, [isAuthenticated, pendingEmail, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!pendingEmail) {
      return;
    }

    if (!password) {
      setError("Ingresá tu contraseña.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: pendingEmail,
        password,
      });

      if (!data?.token || typeof data.token !== "string") {
        throw new Error("No recibimos un token de sesión válido.");
      }

      startSession(data.token);
      clearPendingEmail();
      router.replace("/home");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No pudimos iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!pendingEmail) {
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
          <label className="sr-only" htmlFor="login-password">
            Contraseña
          </label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={error ? "login-password-error" : undefined}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Continuar"}
          </button>

          {error && (
            <p id="login-password-error" className="login-error" role="alert">
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