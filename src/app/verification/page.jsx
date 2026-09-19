"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerificationPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code)) {
      setError("Ingresá un código de 6 dígitos.");
      return;
    }

    if (code !== "123456") {
      setError("Para esta demostración, utilizá el código 123456.");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="auth-page verification-page">
      <header className="auth-header login-header">
        <Link className="brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>
      </header>

      <section className="login-content">
        <h1>Demostración de verificación</h1>

        <p className="login-description">
          Esta pantalla representa el flujo visual de verificación. La cuenta
          no se modifica porque el backend no expone esa operación.
        </p>

        <p className="demo-notice" role="status">
          Código de demostración: <strong>123456</strong>
        </p>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="verification-code">
            Código de verificación
          </label>

          <input
            id="verification-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Código"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            required
          />

          <button type="submit">Finalizar demostración</button>

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