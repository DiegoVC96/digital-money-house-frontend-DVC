"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    sessionStorage.setItem("loginEmail", email);
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
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button>Continuar</button>

          <Link className="create-account-button" href="/register">
            Crear cuenta
          </Link>

          {error && (
            <p className="login-error" role="alert">
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