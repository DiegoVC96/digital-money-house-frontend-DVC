import Link from "next/link";

export default function LandingPage() {
  return <main><h1>Digital Money House</h1><p>Gestioná tu dinero de forma simple: transferí, pagá servicios y administrá tu billetera desde cualquier dispositivo.</p><p><Link href="/register">Crear cuenta</Link>{" | "}<Link href="/login">Iniciar sesión</Link></p></main>;
}
