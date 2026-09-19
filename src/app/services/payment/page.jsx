"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import {
  getAccount,
  getCards,
} from "../../../services/accountService";
import { getServiceById } from "../../../services/serviceService";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useServicePayment } from "../../../context/ServicePaymentContext";
import { useSessionErrorHandler } from "../../../hooks/useSessionErrorHandler";

function formatAmount(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

function getCardName(cardNumber) {
  const number = String(cardNumber);

  if (number.startsWith("4")) {
    return "Visa";
  }

  if (number.startsWith("34") || number.startsWith("37")) {
    return "American Express";
  }

  return "Tarjeta";
}

export default function ServicePaymentPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const { paymentDraft, savePaymentDraft } = useServicePayment();
  const handleSessionError = useSessionErrorHandler();

  const [account, setAccount] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const service = paymentDraft
    ? getServiceById(paymentDraft.serviceId)
    : null;

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    if (!paymentDraft || !service) {
      router.replace("/services");
      return;
    }

    async function loadPaymentMethods() {
      try {
        const accountData = await getAccount(token);
        const cardsData = await getCards(token, accountData.id);

        setAccount(accountData);
        setCards(Array.isArray(cardsData) ? cardsData : []);
      } catch (error) {
        if (handleSessionError(error)) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "No pudimos cargar los medios de pago."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPaymentMethods();
  }, [handleSessionError, isReady, paymentDraft, router, service, token]);

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

  function handlePay() {
  if (!paymentDraft || !account || !selectedMethod) {
    return;
  }

  const availableAmount = Number(account.available_amount ?? 0);

  if (
    selectedMethod === "balance" &&
    (!Number.isFinite(availableAmount) ||
      availableAmount < paymentDraft.amount)
  ) {
    router.push("/services/error");
    return;
  }

  const paymentMethod =
    selectedMethod === "balance"
      ? { type: "balance" }
      : { type: "card", cardId: Number(selectedMethod.replace("card-", "")) };

  savePaymentDraft({
    ...paymentDraft,
    paymentMethod,
  });

  router.push("/services/confirm");
}

  if (!isReady || !paymentDraft || !service) {
    return null;
  }

  return (
    <main className="dashboard-page service-payment-page">
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

      <section className="service-payment-content">
        <Link className="back-link" href={`/services/${service.id}`}>
          ← Revisar dato
        </Link>

        <section className="service-summary-panel">
          <h1>{service.name}</h1>
          <p>Total a pagar</p>
          <strong>{formatAmount(paymentDraft.amount)}</strong>
        </section>

        <section className="payment-methods-panel">
          <h2>Elegí cómo pagar</h2>

          {loading && <p>Cargando medios de pago...</p>}

          {!loading && message && (
            <p className="form-message error" role="alert">
              {message}
            </p>
          )}

          {!loading && account && (
            <label className="service-payment-method">
              <span>
                <strong>Dinero en cuenta</strong>
                <small>
                  Disponible: {formatAmount(account.available_amount)}
                </small>
              </span>

              <input
                type="radio"
                name="payment-method"
                value="balance"
                checked={selectedMethod === "balance"}
                onChange={(event) => {
                  setSelectedMethod(event.target.value);
                  setMessage("");
                }}
              />
            </label>
          )}

          {!loading &&
            cards.map((card) => {
              const lastFour = String(card.number_id).slice(-4);

              return (
                <label className="service-payment-method" key={card.id}>
                  <span>
                    <strong>
                      {getCardName(card.number_id)} terminada en {lastFour}
                    </strong>
                  </span>

                  <input
                    type="radio"
                    name="payment-method"
                    value={String(card.id)}
                    checked={selectedMethod === String(card.id)}
                    onChange={(event) => {
                      setSelectedMethod(event.target.value);
                      setMessage("");
                    }}
                  />
                </label>
              );
            })}
        </section>

        <button
          className="primary-action service-pay-button"
          type="button"
          disabled={loading}
          onClick={handlePay}
        >
          Pagar
        </button>
      </section>

      <footer className="dashboard-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}