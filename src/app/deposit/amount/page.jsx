"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function DepositAmountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get("cardId");

  const [menuOpen, setMenuOpen] = useState(false);
  const [card, setCard] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!cardId) {
      router.replace("/deposit/cards");
      return;
    }

    async function loadCard() {
      try {
        const account = await getAccount(token);
        const cards = await getCards(token, account.id);

        const selected = cards.find(
          (item) => String(item.id) === String(cardId)
        );

        if (!selected) {
          router.replace("/deposit/cards");
          return;
        }

        setCard(selected);
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadCard();
  }, [cardId, router]);

  function handleContinue(event) {
    event.preventDefault();

    const numericAmount = Number(amount.replace(",", "."));

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Ingresá un monto mayor a cero.");
      return;
    }

    router.push(
      `/deposit/confirm?cardId=${cardId}&amount=${numericAmount}`
    );
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

  const cardType = card ? getCardType(card.number_id) : "Tarjeta";
  const lastFour = card ? String(card.number_id).slice(-4) : "----";

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
        <Link className="back-link" href="/deposit/cards">
          ← Elegir otra tarjeta
        </Link>

        <h1>¿Cuánto querés ingresar?</h1>
        <p className="deposit-subtitle">
          El dinero se acreditará en tu cuenta Digital Money House.
        </p>

        <form className="deposit-amount-panel" onSubmit={handleContinue}>
          <div className="selected-deposit-card">
            <span>▣</span>
            <strong>{cardType} terminada en {lastFour}</strong>
          </div>

          <label className="amount-field">
            Monto a ingresar
            <span>
              <b>$</b>
              <input
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value.replace(/[^0-9,.]/g, ""));
                  setMessage("");
                }}
                placeholder="0,00"
                inputMode="decimal"
                autoFocus
              />
            </span>
          </label>

          {message && <p className="form-message error">{message}</p>}

          <button type="submit" className="primary-action deposit-continue">
            Continuar
          </button>
        </form>
      </section>
    </main>
  );
}

export default function DepositAmountPage() {
  return (
    <Suspense fallback={null}>
      <DepositAmountPageContent />
    </Suspense>
  );
}