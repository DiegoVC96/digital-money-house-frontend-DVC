"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "../../services/authService";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstname: "", lastname: "", dni: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function handleChange(event) { const { name, value } = event.target; setForm({ ...form, [name]: value }); }
  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    if (Object.values(form).some((value) => value.trim() === "")) { setError("Completá todos los campos."); return; }
    if (!form.email.includes("@")) { setError("Ingresá un email válido."); return; }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    try { setLoading(true); await registerUser({ ...form, dni: Number(form.dni) }); router.push("/login"); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  return <main><h1>Crear cuenta</h1><form noValidate onSubmit={handleSubmit}>
    <label>Nombre<input name="firstname" value={form.firstname} onChange={handleChange} /></label>
    <label>Apellido<input name="lastname" value={form.lastname} onChange={handleChange} /></label>
    <label>DNI<input name="dni" type="number" value={form.dni} onChange={handleChange} /></label>
    <label>Teléfono<input name="phone" type="tel" value={form.phone} onChange={handleChange} /></label>
    <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
    <label>Contraseña<input name="password" type="password" value={form.password} onChange={handleChange} /></label>
    {error && <p role="alert">{error}</p>}<button disabled={loading}>{loading ? "Creando cuenta..." : "Crear cuenta"}</button>
  </form><p>¿Ya tenés una cuenta? <Link href="/login">Iniciá sesión</Link></p></main>;
}
