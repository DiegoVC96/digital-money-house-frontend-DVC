"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { setPendingEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    setPendingEmail(normalizedEmail);
    router.push("/login/password");
  }

  return (
    <main className="auth-page login-page">
      <header className="auth-header login-header">
        <Link className="brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>
      </header>

      <section className="login-content">
        <h1>¡Hola! Ingresá tu e-mail</h1>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="login-email">
            Correo electrónico
          </label>

          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={error ? "login-email-error" : undefined}
            required
          />

          <button type="submit">Continuar</button>

          <Link className="create-account-button" href="/register">
            Crear cuenta
          </Link>

          {error && (
            <p id="login-email-error" className="login-error" role="alert">
              {error}
            </p>
          )}
        </form>

        <Link className="forgot-password-link" href="/forgot-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </section>

      <footer className="auth-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}