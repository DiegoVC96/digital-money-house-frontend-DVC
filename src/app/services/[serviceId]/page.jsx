"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import { getServiceById } from "../../../services/serviceService";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useServicePayment } from "../../../context/ServicePaymentContext";

export default function ServiceAccountPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const { savePaymentDraft } = useServicePayment();

  const [accountNumber, setAccountNumber] = useState("");
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const serviceId = String(params.serviceId || "");
  const service = getServiceById(serviceId);

  useEffect(() => {
    if (isReady && !service) {
      router.replace("/services");
    }
  }, [isReady, router, service]);

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

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedAccountNumber = accountNumber.replace(/\D/g, "");

    if (!service) {
      return;
    }

    if (normalizedAccountNumber.length !== service.accountLength) {
      setMessage(
        `Ingresá ${service.accountLength} números sin espacios.`
      );
      return;
    }

    if (/^0+$/.test(normalizedAccountNumber)) {
      setMessage("No encontramos facturas asociadas a este dato.");
      return;
    }

    savePaymentDraft({
      serviceId: service.id,
      accountNumber: normalizedAccountNumber,
      amount: service.amount,
    });

    router.push("/services/payment");
  }

  if (!isReady || !service) {
    return null;
  }

  return (
    <main className="dashboard-page service-account-page">
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

      <section className="service-account-content">
        <Link className="back-link" href="/services">
          ← Volver a servicios
        </Link>

        <form className="service-account-panel" onSubmit={handleSubmit}>

          <label>
            {service.accountLabel}
            <input
              inputMode="numeric"
              maxLength={service.accountLength}
              value={accountNumber}
              onChange={(event) => {
                setAccountNumber(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, service.accountLength)
                );
                setMessage("");
              }}
              aria-describedby={
                message ? "service-account-error" : undefined
              }
              required
            />
          </label>

          <p>{service.accountHint}</p>

          {message && (
            <p
              id="service-account-error"
              className="form-message error"
              role="alert"
            >
              {message}
            </p>
          )}

          <button type="submit" className="primary-action">
            Continuar
          </button>
        </form>
      </section>

      <footer className="dashboard-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}