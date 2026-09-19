"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../../services/authService";
import {
  createCard,
  getAccount,
  getCards,
} from "../../../services/accountService";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useSessionErrorHandler } from "../../../hooks/useSessionErrorHandler";

function getCardType(number) {
  if (number.startsWith("4")) return "Visa";
  if (number.startsWith("34") || number.startsWith("37")) return "American Express";

  const firstFour = Number(number.slice(0, 4));
  if (
    (firstFour >= 5100 && firstFour <= 5599) ||
    (firstFour >= 2221 && firstFour <= 2720)
  ) {
    return "Mastercard";
  }

  return "Tarjeta";
}

function passesLuhnCheck(cardNumber) {
  let total = 0;
  let shouldDouble = false;

  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number(cardNumber[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    total += digit;
    shouldDouble = !shouldDouble;
  }

  return total % 10 === 0;
}

function isFutureExpirationDate(value) {
  const match = /^(0[1-9]|1[0-2])\/(20\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = Number(match[2]);

  const expirationMonth = new Date(year, month - 1, 1);
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  return expirationMonth >= currentMonth;
}

export default function NewCardPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const handleSessionError = useSessionErrorHandler();
  const [accountId, setAccountId] = useState(null);
  const [number, setNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [holder, setHolder] = useState("");
  const [cod, setCod] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const cleanNumber = number.replace(/\D/g, "");
  const cardType = getCardType(cleanNumber);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    async function loadAccount() {
      try {
        const account = await getAccount(token);
        const cards = await getCards(token, account.id);

        if (cards.length >= 10) {
          setMessage("Alcanzaste el máximo de 10 tarjetas asociadas.");
          return;
        }

        setAccountId(account.id);
      } catch (error) {
  if (handleSessionError(error)) {
    return;
  }

  setMessage(
    error instanceof Error
      ? error.message
      : "No fue posible cargar los datos de la cuenta."
  );
}
    }

    loadAccount();
  }, [handleSessionError, isReady, token]);

  const [menuOpen, setMenuOpen] = useState(false);

  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiration(value) {
    const digits = value.replace(/\D/g, "").slice(0, 6);

    if (digits.length <= 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const hasValidLength =
    (cardType === "American Express" && cleanNumber.length === 15) ||
    (cardType !== "American Express" && cleanNumber.length === 16);

    const validNumber = hasValidLength && passesLuhnCheck(cleanNumber);

    if (!isFutureExpirationDate(expirationDate)) {
      setMessage("Ingresá una fecha válida con formato MM/AAAA.");
      return;
    }

    if (holder.trim().length < 3) {
      setMessage("Ingresá el nombre y apellido del titular.");
      return;
    }

    if (!/^\d{3,4}$/.test(cod)) {
      setMessage("El código de seguridad debe tener 3 o 4 números.");
      return;
    }

    try {
      setSaving(true);

      if (!token || !accountId) {
        setMessage("Tu sesión ya no está disponible. Iniciá sesión nuevamente.");
        return;
      }

      await createCard(token, accountId, {
        number_id: Number(cleanNumber),
        expiration_date: expirationDate,
        first_last_name: holder.trim(),
        cod: Number(cod),
      });

      router.push("/cards");
    } catch (error) {
  if (handleSessionError(error)) {
    return;
  }

  setMessage(
    error instanceof Error
      ? error.message
      : "No fue posible agregar la tarjeta."
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

if (!isReady) {
  return null;
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
    <button className="sidebar-link" type="button">Pagar servicios</button>
    <Link className="sidebar-link active" href="/cards">Tarjetas</Link>
    <button
      className="sidebar-link logout-link"
      type="button"
      onClick={handleLogout}
    >
      Cerrar sesión
    </button>
  </nav>
</aside>

      <section className="new-card-content">
        <Link href="/cards" className="back-link">
          ← Volver a tus tarjetas
        </Link>

        <form className="card-form-panel" onSubmit={handleSubmit}>
          <h1>Agregá una nueva tarjeta</h1>

          <div className={`card-preview ${cardType.toLowerCase()}`}>
            <span>{cardType}</span>
            <strong>
              {cleanNumber
                ? formatCardNumber(cleanNumber)
                : "0000 0000 0000 0000"}
            </strong>

            <div>
              <small>Vence</small>
              <small>{expirationDate || "MM/AAAA"}</small>
            </div>

            <p>{holder || "NOMBRE Y APELLIDO"}</p>
          </div>

          <div className="card-fields">
            <label>
              Número de la tarjeta*
              <input
                value={number}
                onChange={(event) =>
                  setNumber(formatCardNumber(event.target.value))
                }
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
              />
            </label>

            <label>
              Fecha de vencimiento*
              <input
                value={expirationDate}
                onChange={(event) =>
                  setExpirationDate(formatExpiration(event.target.value))
                }
                placeholder="MM/AAAA"
                inputMode="numeric"
              />
            </label>

            <label>
              Nombre y apellido*
              <input
                value={holder}
                onChange={(event) => setHolder(event.target.value)}
                placeholder="Como figura en la tarjeta"
              />
            </label>

            <label>
              Código de seguridad*
              <input
                value={cod}
                onChange={(event) =>
                  setCod(event.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="000"
                inputMode="numeric"
                type="password"
              />
            </label>
          </div>

          {message && <p className="form-message error">{message}</p>}

          <button
            type="submit"
            className="primary-action add-card-button"
            disabled={saving || !accountId}
          >
            {saving ? "Guardando..." : "Continuar"}
          </button>
        </form>
      </section>
    </main>
  );
}