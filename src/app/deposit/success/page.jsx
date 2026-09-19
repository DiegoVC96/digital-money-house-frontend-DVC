"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import {
  getAccount,
  getTransaction,
} from "../../../services/accountService";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useSessionErrorHandler } from "../../../hooks/useSessionErrorHandler";
import { downloadReceiptPdf } from "../../../services/receiptPdfService";

function formatAmount(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function DepositSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const handleSessionError = useSessionErrorHandler();

  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const transactionId = Number(searchParams.get("transactionId"));

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      router.replace("/activity");
      return;
    }

    async function loadReceipt() {
      setLoading(true);
      setMessage("");

      try {
        const accountData = await getAccount(token);
        const transactionData = await getTransaction(
          token,
          accountData.id,
          transactionId
        );

        setAccount(accountData);
        setTransaction(transactionData);
      } catch (error) {
        if (handleSessionError(error)) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "No pudimos cargar el comprobante."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReceipt();
  }, [handleSessionError, isReady, router, token, transactionId]);

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

  if (!isReady || loading) {
    return null;
  }

  if (!transaction) {
    return (
      <main className="dashboard-page">
        <p className="form-message error" role="alert">
          {message || "No pudimos encontrar este comprobante."}
        </p>

        <Link className="primary-action" href="/activity">
          Ver actividad
        </Link>
      </main>
    );
  }

  const amount = Number(transaction.amount ?? 0);
  const origin = transaction.origin || "No disponible";
  const destination =
    transaction.destination || "Cuenta Digital Money House";
  const operation = transaction.id || transactionId;

  function handleDownloadReceipt() {
    downloadReceiptPdf({
      title: "Comprobante de ingreso",
      date: formatDate(transaction.dated),
      amount: formatAmount(amount),
      origin,
      destination,
      operation,
    });
  }

  return (
    <main className="dashboard-page deposit-page">
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
          onClick={() => setMenuOpen(!menuOpen)}
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
          <Link className="sidebar-link active" href="/deposit">
            Cargar dinero
          </Link>
          <button className="sidebar-link" type="button">
            Pagar servicios
          </button>
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

      <section className="receipt-content">
        <section className="receipt-shell">
          <div className="receipt-brand">
            DIGITAL <span>MONEY HOUSE</span>
          </div>

          <div className="receipt-heading">
            <h1>Comprobante de ingreso</h1>
            <p>{formatDate(transaction.dated)}</p>
          </div>

          <section className="receipt-card">
            <span className="receipt-label">Ingreso de dinero</span>
            <strong className="receipt-amount">
              {formatAmount(amount)}
            </strong>

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
                  <strong>{destination}</strong>
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
            <button
              className="secondary-action"
              type="button"
              onClick={handleDownloadReceipt}
            >
              Descargar comprobante PDF
            </button>

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
