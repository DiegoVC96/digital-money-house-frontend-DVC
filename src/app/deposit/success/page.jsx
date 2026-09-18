"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import { getAccount } from "../../../services/accountService";

function DepositSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);

  const amount = Number(searchParams.get("amount")) || 0;
  const origin = searchParams.get("origin") || "Tarjeta asociada";
  const operation = searchParams.get("operation") || "No disponible";

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

  async function handleLogout() {
    const token = localStorage.getItem("token");

    try {
      await logoutUser(token);
    } finally {
      localStorage.removeItem("token");
      router.push("/");
    }
  }

  const formattedAmount = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

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
          <button className="sidebar-link logout-link" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <section className="receipt-content">
        <section className="receipt-shell">
          <div className="receipt-brand">
            DIGITAL <span>MONEY HOUSE</span>
          </div>

          <div className="receipt-heading">
            <h1>Comprobante de ingreso</h1>
            <p>{formattedDate}</p>
          </div>

          <section className="receipt-card">
            <span className="receipt-label">Ingreso de dinero</span>
            <strong className="receipt-amount">{formattedAmount}</strong>

            <div className="receipt-route">
              <div className="receipt-route-item">
                <span className="route-dot" />
                <div>
                  <small>Desde</small>
                  <strong>{origin}</strong>
                  <p>Medio de pago asociado</p>
                </div>
              </div>

              <div className="receipt-route-item">
                <span className="route-dot" />
                <div>
                  <small>Para</small>
                  <strong>Cuenta Digital Money House</strong>
                  <p>CVU: {account?.cvu || "No disponible"}</p>
                </div>
              </div>
            </div>

            <div className="receipt-code">
              <span>Código de operación</span>
              <strong>{operation}</strong>
            </div>
          </section>

          <div className="receipt-actions">
            <Link className="secondary-action" href="/activity">
              Ver actividad
            </Link>

            <Link className="primary-action" href="/home">
              Ir al inicio
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

export default function DepositSuccessPage() {
  return (
    <Suspense fallback={null}>
      <DepositSuccessPageContent />
    </Suspense>
  );
}