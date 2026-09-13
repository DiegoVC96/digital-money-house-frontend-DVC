"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginUser } from "../../../services/authService";

export default function LoginPasswordPage() {
  const router = useRouter(); const [email, setEmail] = useState(null); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { setEmail(sessionStorage.getItem("loginEmail")); }, []);
  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    if (!password) { setError("Ingresá tu contraseña."); return; }
    try { setLoading(true); const data = await loginUser({ email, password }); localStorage.setItem("token", data.token); sessionStorage.removeItem("loginEmail"); router.push("/home"); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  if (email === null) return <main><p>Cargando...</p></main>;
  if (!email) return <main><p>Primero ingresá tu email.</p><Link href="/login">Volver al login</Link></main>;
  return <main><h1>Ingresá tu contraseña</h1><p>{email}</p><form onSubmit={handleSubmit}><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p role="alert">{error}</p>}<button disabled={loading}>{loading ? "Ingresando..." : "Iniciar sesión"}</button></form><Link href="/login">Usar otro email</Link></main>;
}
