"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "../../services/authService";

const passwordPattern =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    dni: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((value) => value.trim() === "")) {
      setError("Completá todos los campos.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Ingresá un correo electrónico válido.");
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

    try {
      setLoading(true);

      await registerUser({
        firstname: form.firstname,
        lastname: form.lastname,
        dni: Number(form.dni),
        phone: form.phone,
        email: form.email,
        password: form.password,
      });

      router.push("/register/success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link className="brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>

        <Link className="auth-header-button" href="/login">
          Iniciar sesión
        </Link>
      </header>

      <section className="auth-content">
        <h1>Crear cuenta</h1>

        <form className="register-form" noValidate onSubmit={handleSubmit}>
          <input
            name="firstname"
            placeholder="Nombre*"
            value={form.firstname}
            onChange={handleChange}
          />

          <input
            name="lastname"
            placeholder="Apellido*"
            value={form.lastname}
            onChange={handleChange}
          />

          <input
            name="dni"
            type="number"
            placeholder="DNI*"
            value={form.dni}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Correo electrónico*"
            value={form.email}
            onChange={handleChange}
          />

          <p className="password-help">
            Usa entre 6 y 20 caracteres (debe contener al menos 1 carácter
            especial, una mayúscula y un número).
          </p>

          <span />

          <input
            name="password"
            type="password"
            placeholder="Contraseña*"
            value={form.password}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña*"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <input
            name="phone"
            type="tel"
            placeholder="Teléfono*"
            value={form.phone}
            onChange={handleChange}
          />

          <button disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          {error && (
            <p className="register-error" role="alert">
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