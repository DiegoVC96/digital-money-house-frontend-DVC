"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const passwordPattern =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/;

export default function ConfirmPasswordPage() {
  const router = useRouter();
  const { isRecoveryFlowActive, endRecoveryFlow } = useAuth();

  const [form, setForm] = useState({
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isRecoveryFlowActive) {
      router.replace("/forgot-password");
    }
  }, [isRecoveryFlowActive, router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.code !== "654321") {
      setError("Para esta demostración, utilizá el código 654321.");
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

    endRecoveryFlow();
    router.push("/login");
  }

  if (!isRecoveryFlowActive) {
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
        <h1>Demostración de nueva contraseña</h1>

        <p className="login-description">
          Esta pantalla valida la experiencia visual. No modifica contraseñas
          reales porque el backend no expone ese servicio.
        </p>

        <p className="demo-notice" role="status">
          Código de demostración: <strong>654321</strong>
        </p>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="recovery-code">
            Código de recuperación
          </label>

          <input
            id="recovery-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Código de recuperación"
            value={form.code}
            onChange={(event) => {
              setForm((currentForm) => ({
                ...currentForm,
                code: event.target.value.replace(/\D/g, ""),
              }));
            }}
            required
          />

          <label className="sr-only" htmlFor="new-password">
            Nueva contraseña
          </label>

          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Nueva contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="sr-only" htmlFor="confirm-password">
            Confirmar nueva contraseña
          </label>

          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirmar nueva contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
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