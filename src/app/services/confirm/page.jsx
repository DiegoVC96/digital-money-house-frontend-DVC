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

export default function ServicePaymentConfirmPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const { paymentDraft } = useServicePayment();
  const [menuOpen, setMenuOpen] = useState(false);

  const service = paymentDraft
    ? getServiceById(paymentDraft.serviceId)
    : null;

  useEffect(() => {
    if (isReady && (!paymentDraft || !service || !paymentDraft.paymentMethod)) {
      router.replace("/services");
    }
  }, [isReady, paymentDraft, router, service]);

  if (!isReady || !paymentDraft || !service || !paymentDraft.paymentMethod) {
    return null;
  }

  const paymentMethodLabel =
    paymentDraft.paymentMethod.type === "balance"
      ? "Dinero en cuenta"
      : "Tarjeta asociada";

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

  function handleConfirm() {
    router.push("/services/success");
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

      <section className="service-confirm-content">
        <Link className="back-link" href="/services/payment">
          ← Modificar medio de pago
        </Link>

        <h1>Confirmá el pago</h1>
        <p>Revisá los datos antes de continuar.</p>

        <article className="service-confirm-panel">
          <div className="service-confirm-row">
            <span>Servicio</span>
            <strong>{service.name}</strong>
          </div>

          <div className="service-confirm-row">
            <span>Monto a pagar</span>
            <strong className="service-confirm-amount">
              {formatAmount(paymentDraft.amount)}
            </strong>
          </div>

          <div className="service-confirm-row">
            <span>Medio de pago</span>
            <strong>{paymentMethodLabel}</strong>
          </div>

          <p className="service-demo-note">
            Operación de demostración: no se enviará un pago real al proveedor.
          </p>

          <div className="service-result-actions">
            <Link className="secondary-button" href="/services/payment">
              Cancelar
            </Link>

            <button
              className="primary-button service-confirm-button"
              type="button"
              onClick={handleConfirm}
            >
              Confirmar pago
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}