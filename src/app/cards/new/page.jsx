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

export default function NewCardPage() {
  const router = useRouter();

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
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
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
        setMessage(error.message);
      }
    }

    loadAccount();
  }, [router]);

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

    const validNumber =
      (cardType === "American Express" && cleanNumber.length === 15) ||
      (cardType !== "American Express" && cleanNumber.length === 16);

    if (!validNumber) {
      setMessage("Ingresá un número de tarjeta válido.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/20\d{2}$/.test(expirationDate)) {
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

      const token = localStorage.getItem("token");

      await createCard(token, accountId, {
        number_id: Number(cleanNumber),
        expiration_date: expirationDate,
        first_last_name: holder.trim(),
        cod: Number(cod),
      });

      router.push("/cards");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logoutUser().finally(() => router.push("/"));
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
    <button className="sidebar-link" type="button">Cargar dinero</button>
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