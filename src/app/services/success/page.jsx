"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import { getServiceById } from "../../../services/serviceService";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useServicePayment } from "../../../context/ServicePaymentContext";

function formatAmount(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

export default function ServicePaymentSuccessPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const { paymentDraft, clearPaymentDraft } = useServicePayment();
  const [menuOpen, setMenuOpen] = useState(false);

  // Conserva únicamente el resumen visual de esta sesión.
  const [completedPayment] = useState(() => paymentDraft);

  const service = completedPayment
    ? getServiceById(completedPayment.serviceId)
    : null;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!completedPayment || !service) {
      router.replace("/services");
      return;
    }

    clearPaymentDraft();
  }, [clearPaymentDraft, completedPayment, isReady, router, service]);

  if (!isReady || !completedPayment || !service) {
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
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          ☰
        </button>
      </header>

      <aside className={`dashboard-sidebar ${menuOpen ? "open" : ""}`}>
        <nav aria-label="Navegación principal">
          <Link className="sidebar-link" href="/home">Inicio</Link>
          <Link className="sidebar-link" href="/activity">Actividad</Link>
          <Link className="sidebar-link" href="/profile">Tu perfil</Link>
          <Link className="sidebar-link" href="/deposit">Cargar dinero</Link>
          <Link className="sidebar-link active" href="/services">
            Pagar servicios
          </Link>
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

      <section className="service-success-content">
        <article className="service-success-panel">
          <span className="service-success-icon" aria-hidden="true">
            ✓
          </span>

          <h1>Pago registrado</h1>

          <p>
            Registramos el pago de{" "}
            <strong>{formatAmount(completedPayment.amount)}</strong> para{" "}
            <strong>{service.name}</strong>.
          </p>

          <p className="service-demo-note">
            Comprobante de demostración: el backend no dispone de un endpoint
            para confirmar pagos a proveedores.
          </p>

          <div className="service-result-actions">
            <Link className="secondary-button" href="/services">
              Ver servicios
            </Link>

            <Link className="primary-button" href="/home">
              Ir al inicio
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}