"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(""); const [error, setError] = useState("");
  function handleSubmit(event) { event.preventDefault(); if (!email.includes("@")) { setError("Ingresá un email válido."); return; } sessionStorage.setItem("loginEmail", email); router.push("/login/password"); }
  return <main><h1>Iniciar sesión</h1><p>Ingresá tu email para continuar.</p><form onSubmit={handleSubmit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p role="alert">{error}</p>}<button>Continuar</button></form><p>¿No tenés cuenta? <Link href="/register">Creá una</Link></p></main>;
}
