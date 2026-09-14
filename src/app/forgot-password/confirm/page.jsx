"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const passwordPattern =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/;

export default function ConfirmPasswordPage() {
  const router = useRouter();
  const [hasRecoveryEmail, setHasRecoveryEmail] = useState(null);
  const [form, setForm] = useState({
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setHasRecoveryEmail(Boolean(sessionStorage.getItem("recoveryEmail")));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.code !== "654321") {
      setError("El código de recuperación no es válido.");
      return;
    }

    if (!passwordPattern.test(form.password)) {
      setError(
        "La contraseña debe tener entre 6 y 20 caracteres, una mayúscula, un número y un carácter especial."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    sessionStorage.removeItem("recoveryEmail");
    sessionStorage.setItem("passwordResetDemo", "true");
    router.push("/login");
  }

  if (hasRecoveryEmail === null) {
    return null;
  }

  if (!hasRecoveryEmail) {
    router.replace("/forgot-password");
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
        <h1>Creá una nueva contraseña</h1>
        <p className="login-description">
          Código de demostración: <strong>654321</strong>
        </p>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <input
            name="code"
            inputMode="numeric"
            maxLength="6"
            placeholder="Código de recuperación"
            value={form.code}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Nueva contraseña"
            value={form.password}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button>Guardar contraseña</button>

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