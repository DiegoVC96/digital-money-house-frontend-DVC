"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { startRecoveryFlow } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!emailPattern.test(email.trim().toLowerCase())) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    startRecoveryFlow();
    router.push("/forgot-password/confirm");
  }

  return (
    <main className="auth-page login-page">
      <header className="auth-header login-header">
        <Link className="brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>
      </header>

      <section className="login-content">
        <h1>Recuperá tu contraseña</h1>

        <p className="login-description">
          Ingresá tu email para continuar con la demostración.
        </p>

        <p className="demo-notice" role="status">
          Demo visual: este entorno no envía correos ni modifica contraseñas.
        </p>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="recovery-email">
            Correo electrónico
          </label>

          <input
            id="recovery-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={error ? "recovery-email-error" : undefined}
            required
          />

          <button type="submit">Continuar</button>

          {error && (
            <p id="recovery-email-error" className="login-error" role="alert">
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