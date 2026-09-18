"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import { getAccount, getCards } from "../../../services/accountService";

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

export default function DepositCardsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadCards() {
      try {
        const account = await getAccount(token);
        const cardList = await getCards(token, account.id);

        setCards(Array.isArray(cardList) ? cardList : []);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadCards();
  }, [router]);

  function handleContinue() {
    if (!selectedCard) {
      setMessage("Seleccioná una tarjeta para continuar.");
      return;
    }

    router.push(`/deposit/amount?cardId=${selectedCard}`);
  }

  async function handleLogout() {
    const token = localStorage.getItem("token");

    try {
      await logoutUser(token);
    } finally {
      localStorage.removeItem("token");
      router.push("/");
    }
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
        <Link className="back-link" href="/deposit">
          ← Elegir otro medio
        </Link>

        <h1>Elegí una tarjeta</h1>
        <p className="deposit-subtitle">
          Seleccioná la tarjeta desde la que querés ingresar dinero.
        </p>

        <section className="deposit-card-panel">
          {loading && <p>Cargando tarjetas...</p>}

          {!loading && message && (
            <p className="form-message error">{message}</p>
          )}

          {!loading && !message && cards.length === 0 && (
            <div className="deposit-empty-state">
              <p>No tenés tarjetas asociadas.</p>
              <Link className="primary-action" href="/cards/new">
                Agregar una tarjeta
              </Link>
            </div>
          )}

          {!loading && cards.length > 0 && (
            <>
              <div className="payment-card-list">
                {cards.map((card) => {
                  const cardType = getCardType(card.number_id);
                  const lastFour = String(card.number_id).slice(-4);

                  return (
                    <label
                      className={`payment-card-choice ${
                        selectedCard === String(card.id) ? "selected" : ""
                      }`}
                      key={card.id}
                    >
                      <input
                        type="radio"
                        name="card"
                        value={card.id}
                        checked={selectedCard === String(card.id)}
                        onChange={(event) => {
                          setSelectedCard(event.target.value);
                          setMessage("");
                        }}
                      />

                      <span className="card-choice-icon">▣</span>

                      <span>
                        <strong>{cardType} terminada en {lastFour}</strong>
                        <small>Vencimiento {card.expiration_date}</small>
                      </span>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                className="primary-action deposit-continue"
                onClick={handleContinue}
              >
                Continuar
              </button>
            </>
          )}
        </section>
      </section>
    </main>
  );
}