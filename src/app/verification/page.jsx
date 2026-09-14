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
      setError("El código de verificación no es válido.");
      return;
    }

    sessionStorage.setItem("emailVerified", "true");
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
        <h1>Ingresá el código de verificación</h1>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <input
            inputMode="numeric"
            maxLength="6"
            placeholder="Código"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, ""))
            }
          />

          <button>Continuar</button>

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