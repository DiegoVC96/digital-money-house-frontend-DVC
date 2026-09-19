"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import {
  createDeposit,
  getAccount,
  getCards,
} from "../../../services/accountService";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useSessionErrorHandler } from "../../../hooks/useSessionErrorHandler";

function getCardType(number) {
  const value = String(number);

  if (value.startsWith("4")) return "Visa";
  if (value.startsWith("34") || value.startsWith("37")) {
    return "American Express";
  }

  const firstFour = Number(value.slice(0, 4));

  if (
    (firstFour >= 5100 && firstFour <= 5599) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "Mastercard";
  }

  return "Tarjeta";
}

function DepositConfirmPageContent() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const handleSessionError = useSessionErrorHandler();
  const searchParams = useSearchParams();
  const cardId = searchParams.get("cardId");
  const amount = Number(searchParams.get("amount"));

  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [card, setCard] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    if (!cardId || !amount || amount <= 0) {
      router.replace("/deposit/cards");
      return;
    }

    async function loadSummary() {
      try {
        const accountData = await getAccount(token);
        const cards = await getCards(token, accountData.id);

        const selected = cards.find(
          (item) => String(item.id) === String(cardId)
        );

        if (!selected) {
          router.replace("/deposit/cards");
          return;
        }

        setAccount(accountData);
        setCard(selected);
      } catch (error) {
  if (handleSessionError(error)) {
    return;
  }

  setMessage(
    error instanceof Error
      ? error.message
      : "No pudimos cargar la información necesaria."
  );
}
    }

    loadSummary();
  }, [amount, cardId, handleSessionError, endSession, isReady, router, token]);

  function formatAmount(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  }

  async function handleConfirm() {
    try {
      setSaving(true);
      setMessage("");

      if (!token || !account || !card) {
        setMessage("Tu sesión ya no está disponible. Iniciá sesión nuevamente.");
        return;
      }

      const cardType = getCardType(card.number_id);
      const lastFour = String(card.number_id).slice(-4);

      const deposit = await createDeposit(token, account.id, {
        amount,
        dated: new Date().toISOString(),
        origin: `${cardType} terminada en ${lastFour}`,
        destination: "Cuenta Digital Money House",
      });

      const transactionId = Number(deposit?.id);

      if (!Number.isInteger(transactionId) || transactionId <= 0) {
        throw new Error("No recibimos un identificador válido para la operación.");
      }

      router.push(
        `/deposit/success?transactionId=${encodeURIComponent(
          String(transactionId)
        )}`
      );

      router.push(`/deposit/success?${params.toString()}`);
    } catch (error) {
  if (handleSessionError(error)) {
    return;
  }

  setMessage(
    error instanceof Error
      ? error.message
      : "No fue posible realizar el ingreso."
  );
} finally {
      setSaving(false);
    }
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

  const cardType = card ? getCardType(card.number_id) : "Tarjeta";
  const lastFour = card ? String(card.number_id).slice(-4) : "----";

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
        <Link className="back-link" href={`/deposit/amount?cardId=${cardId}`}>
          ← Modificar monto
        </Link>

        <h1>Confirmá el ingreso</h1>
        <p className="deposit-subtitle">
          Revisá los datos antes de acreditar el dinero.
        </p>

        <section className="deposit-confirm-panel">
          <dl>
            <div>
              <dt>Monto a ingresar</dt>
              <dd>{formatAmount(amount)}</dd>
            </div>

            <div>
              <dt>Tarjeta</dt>
              <dd>{cardType} terminada en {lastFour}</dd>
            </div>

            <div>
              <dt>Destino</dt>
              <dd>Cuenta Digital Money House</dd>
            </div>
          </dl>

          {message && <p className="form-message error">{message}</p>}

          <div className="confirm-actions">
            <Link className="secondary-action" href={`/deposit/amount?cardId=${cardId}`}>
              Cancelar
            </Link>

            <button
              type="button"
              className="primary-action deposit-continue"
              onClick={handleConfirm}
              disabled={saving || !account || !card}
            >
              {saving ? "Ingresando..." : "Confirmar ingreso"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default function DepositConfirmPage() {
  return (
    <Suspense fallback={null}>
      <DepositConfirmPageContent />
    </Suspense>
  );
}