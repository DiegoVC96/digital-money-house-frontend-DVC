"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useServicePayment } from "../../../context/ServicePaymentContext";
import { getServiceById } from "../../../services/serviceService";
import { logoutUser } from "../../../services/authService";

export default function ServicePaymentErrorPage() {
  const router = useRouter();
  const { endSession } = useAuth();
  const { token, isReady } = useRequireAuth();
  const { paymentDraft } = useServicePayment();
  const [menuOpen, setMenuOpen] = useState(false);

  const service = paymentDraft
    ? getServiceById(paymentDraft.serviceId)
    : null;

  useEffect(() => {
    if (isReady && (!paymentDraft || !service)) {
      router.replace("/services");
    }
  }, [isReady, paymentDraft, router, service]);

  if (!isReady || !paymentDraft || !service) {
    return null;
  }

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

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
  <Link
    className="dashboard-brand"
    href="/"
    aria-label="Digital Money House"
  >
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
    onClick={() => setMenuOpen((isOpen) => !isOpen)}
  >
    ☰
  </button>
</header>

<aside className={`dashboard-sidebar ${menuOpen ? "open" : ""}`}>
  <nav aria-label="Navegación principal">
    <Link className="sidebar-link" href="/home">
      Inicio
    </Link>
    <Link className="sidebar-link" href="/activity">
      Actividad
    </Link>
    <Link className="sidebar-link" href="/profile">
      Tu perfil
    </Link>
    <Link className="sidebar-link" href="/deposit">
      Cargar dinero
    </Link>
    <Link className="sidebar-link active" href="/services">
      Pagar servicios
    </Link>
    <Link className="sidebar-link" href="/cards">
      Tarjetas
    </Link>
    <button
      className="sidebar-link logout-link"
      type="button"
      onClick={handleLogout}
    >
      Cerrar sesión
    </button>
  </nav>
</aside>

      <section className="service-result-content">
        <Link className="back-link" href="/services/payment">
          ← Volver a intentar
        </Link>

        <article className="service-error-panel">
          <span className="service-error-icon" aria-hidden="true">
            ×
          </span>

          <h1>No pudimos realizar tu pago</h1>

          <p>
            No tenés saldo suficiente para pagar{" "}
            <strong>{service.name}</strong>.
          </p>

          <p className="service-error-help">
            Podés cargar dinero en tu cuenta o elegir otro medio de pago.
          </p>

          <div className="service-result-actions">
            <Link className="secondary-button" href="/deposit">
              Cargar dinero
            </Link>

            <Link className="primary-button" href="/services/payment">
              Elegir otro medio
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}