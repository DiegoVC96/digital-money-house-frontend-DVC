"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser } from "../../services/authService";
import {
  deleteCard,
  getAccount,
  getCards,
} from "../../services/accountService";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useSessionErrorHandler } from "../../hooks/useSessionErrorHandler";
import { useCurrentUserName } from "../../hooks/useCurrentUserName";

function getCardType(number) {
  const value = String(number);
  const firstFour = Number(value.slice(0, 4));

  if (value.startsWith("4")) return "Visa";
  if (value.startsWith("34") || value.startsWith("37")) return "AMEX";
  if (
    (firstFour >= 5100 && firstFour <= 5599) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "Mastercard";
  }

  return "Tarjeta";
}

export default function CardsPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const handleSessionError = useSessionErrorHandler();
  const userName = useCurrentUserName(token, isReady);
  const [allowed, setAllowed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [cards, setCards] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCards() {
      if (!isReady || !token) {
        return;
      }

      try {
        const accountData = await getAccount(token);
        const cardData = await getCards(token, accountData.id);

        setAccount(accountData);
        setCards(Array.isArray(cardData) ? cardData : []);
        setAllowed(true);
      } catch (requestError) {
  if (handleSessionError(requestError)) {
    return;
  }

  setMessage(
    requestError instanceof Error
      ? requestError.message
      : "No fue posible cargar las tarjetas."
  );
} finally {
        setLoading(false);
      }
    }

    loadCards();
  }, [handleSessionError, isReady, token]);

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

  async function handleDelete(cardId) {
    if (!window.confirm("¿Querés eliminar esta tarjeta?")) {
      return;
    }

    try {
      if (!token || !account) {
        return;
      }
      await deleteCard(token, account.id, cardId);
      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardId)
      );
      setMessage("Tarjeta eliminada.");
    } catch (requestError) {
  if (handleSessionError(requestError)) {
    return;
  }

  setMessage(
    requestError instanceof Error
      ? requestError.message
      : "No fue posible eliminar la tarjeta."
  );
}
  }

  if (!isReady) {
    return null;
  }

  if (loading) {
    return <main className="dashboard-page">Cargando tarjetas...</main>;
  }

  if (!allowed || !account) {
    return (
      <main className="dashboard-page">
        <p className="profile-loading-error">
          {message || "No fue posible cargar las tarjetas."}
        </p>
      </main>
    );
  }

  return (
    <main className="dashboard-page cards-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>

        <Link className="dashboard-user" href="/home">
          <span className="dashboard-avatar">MB</span>
          <span>Hola, {userName}</span>
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
          <Link className="sidebar-link" href="/deposit">Cargar dinero</Link>
          <Link className="sidebar-link" href="/services">Pagar servicios</Link>
          <Link className="sidebar-link active" href="/cards">Tarjetas</Link>
          <button className="sidebar-link logout-link" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <section className="cards-content">
        <Link
          className={`new-card-link ${cards.length >= 10 ? "disabled" : ""}`}
          href={cards.length >= 10 ? "/cards" : "/cards/new"}
          onClick={(event) => {
            if (cards.length >= 10) {
              event.preventDefault();
              setMessage("Alcanzaste el máximo de 10 tarjetas.");
            }
          }}
        >
          <span>
            <small>Agregá tu tarjeta de débito o crédito</small>
            <strong><b>＋</b> Nueva tarjeta</strong>
          </span>
          <span aria-hidden="true">→</span>
        </Link>

        <section className="cards-list-panel">
          <h1>Tus tarjetas</h1>

          {cards.length === 0 ? (
            <p className="empty-cards-message">No tienes tarjetas asociadas.</p>
          ) : (
            cards.map((card) => {
              const cardNumber = String(card.number_id);

              return (
                <article className="saved-card-row" key={card.id}>
                  <span className="activity-dot" aria-hidden="true" />
                  <p>
                    {getCardType(cardNumber)} terminada en{" "}
                    {cardNumber.slice(-4)}
                  </p>
                  <button type="button" onClick={() => handleDelete(card.id)}>
                    Eliminar
                  </button>
                </article>
              );
            })
          )}

          {message && <p className="cards-message" role="alert">{message}</p>}
        </section>
      </section>

      <footer className="dashboard-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}
