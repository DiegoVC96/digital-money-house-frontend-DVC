"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccount } from "../../../services/accountService";
import { logoutUser } from "../../../services/authService";

export default function ExternalDepositPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    getAccount(token)
      .then(setAccount)
      .catch(() => router.replace("/login"));
  }, [router]);

  const copyValue = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copiado al portapapeles.`);
    } catch {
      setMessage(`No se pudo copiar el ${label.toLowerCase()}.`);
    }
  };

  async function handleLogout() {
    const token = localStorage.getItem("token");

    try {
      await logoutUser(token);
    } finally {
      localStorage.removeItem("token");
      router.push("/");
    }
  }

  const cvu = account?.cvu || "No disponible";
  const alias = account?.alias || "No disponible";

  return (
    <main className="dashboard-page">
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
        <nav>
          <Link className="sidebar-link" href="/home">Inicio</Link>
          <Link className="sidebar-link" href="/activity">Actividad</Link>
          <Link className="sidebar-link" href="/profile">Tu perfil</Link>
          <Link className="sidebar-link active" href="/deposit">Cargar dinero</Link>
          <button className="sidebar-link" type="button">Pagar servicios</button>
          <Link className="sidebar-link" href="/cards">Tarjetas</Link>
          <button className="sidebar-link logout-link" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <section className="deposit-content external-deposit-content">
        <Link className="back-link" href="/deposit">
          ← Elegir otro medio
        </Link>

        <h1>Ingresá desde otra cuenta</h1>
        <p className="deposit-subtitle">
          Transferí dinero desde otra cuenta a tu billetera Digital Money House.
        </p>

        <section className="external-deposit-panel">
          <h2>Datos para recibir una transferencia</h2>
          <p>Copiá el CVU o alias y usalo desde la otra cuenta.</p>

          <div className="transfer-data">
            <div>
              <span>CVU</span>
              <strong>{cvu}</strong>
            </div>

            <button type="button" onClick={() => copyValue(cvu, "CVU")}>
              Copiar CVU
            </button>
          </div>

          <div className="transfer-data">
            <div>
              <span>Alias</span>
              <strong>{alias}</strong>
            </div>

            <button type="button" onClick={() => copyValue(alias, "Alias")}>
              Copiar alias
            </button>
          </div>

          {message && <p className="copy-message">{message}</p>}
        </section>
      </section>
    </main>
  );
}