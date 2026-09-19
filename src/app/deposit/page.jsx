"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";

export default function DepositPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
  try {
    if (token) {
      await logoutUser(token);
    }
  } finally {
    endSession();
    router.replace("/");
  }
}

if (!isReady) {
  return null;
}

  return (
    <main className="dashboard-page deposit-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>

        <Link className="dashboard-user" href="/home">
          <span className="dashboard-avatar">MB</span>
          <span>Hola, usuario</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </header>

      <aside className={`dashboard-sidebar ${menuOpen ? "open" : ""}`}>
        <nav aria-label="Navegación principal">
          <Link className="sidebar-link" href="/home">Inicio</Link>
          <Link className="sidebar-link" href="/activity">Actividad</Link>
          <Link className="sidebar-link" href="/profile">Tu perfil</Link>
          <Link className="sidebar-link active" href="/deposit">Cargar dinero</Link>
          <button className="sidebar-link" type="button">Pagar servicios</button>
          <Link className="sidebar-link" href="/cards">Tarjetas</Link>
          <button
            className="sidebar-link logout-link"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <section className="deposit-content">
        <Link className="back-link" href="/home">
          ← Volver al inicio
        </Link>

        <h1>Ingresá dinero</h1>
        <p className="deposit-subtitle">
          Elegí cómo querés cargar saldo en tu billetera.
        </p>

        <div className="deposit-options">
          <Link className="deposit-option" href="/deposit/cards">
            <span className="deposit-option-icon">▣</span>

            <span>
              <small>Usá una tarjeta asociada</small>
              <strong>Ingresar desde tarjeta</strong>
            </span>

            <span aria-hidden="true">→</span>
          </Link>

          <Link className="deposit-option" href="/deposit/external">
            <span className="deposit-option-icon">◎</span>

            <span>
              <small>Transferí desde otra cuenta</small>
              <strong>Ingresar desde otra cuenta</strong>
            </span>

            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}