"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser } from "../../services/authService";

export default function HomePage() {
  const router = useRouter(); const [allowed, setAllowed] = useState(false);
  useEffect(() => { if (!localStorage.getItem("token")) { router.replace("/login"); return; } setAllowed(true); }, [router]);
  async function handleLogout() { const token = localStorage.getItem("token"); try { await logoutUser(token); } finally { localStorage.removeItem("token"); router.push("/"); } }
  if (!allowed) return null;
  return <main><h1>Bienvenido a Digital Money House</h1><p>Tu sesión está iniciada.</p><button onClick={handleLogout}>Cerrar sesión</button></main>;
}
