"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../services/authService";
import {
  getAccount,
  getAccountActivity,
} from "../../services/accountService";

function getMovementDate(movement) {
  return (
    movement.dated ||
    movement.date ||
    movement.created_at ||
    movement.createdAt ||
    ""
  );
}

function getMovementDescription(movement) {
  return (
    movement.description ||
    movement.name ||
    movement.type ||
    movement.concept ||
    "Movimiento"
  );
}

function getMovementAmount(movement) {
  return Number(movement.amount ?? movement.total ?? movement.value ?? 0);
}

export default function ActivityPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadActivity() {
      try {
        const account = await getAccount(token);
        const response = await getAccountActivity(token, account.id);

        const activity =
          Array.isArray(response)
            ? response
            : response.activities || response.data || [];

        const ordered = [...activity].sort((a, b) => {
          return new Date(getMovementDate(b)) - new Date(getMovementDate(a));
        });

        setMovements(ordered);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [router]);

  const filteredMovements = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return movements;

    return movements.filter((movement) =>
      getMovementDescription(movement).toLowerCase().includes(text)
    );
  }, [movements, search]);

  function formatAmount(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  }

  function formatDate(value) {
    if (!value) return "Sin fecha";

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }

  function handleLogout() {
    logoutUser().finally(() => router.push("/"));
  }

  return (
    <main className="dashboard-page activity-page">
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
          <Link className="sidebar-link active" href="/activity">Actividad</Link>
          <Link className="sidebar-link" href="/profile">Tu perfil</Link>
          <button className="sidebar-link" type="button">Cargar dinero</button>
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

      <section className="activity-content">
        <h1>Tu actividad</h1>

        <label className="activity-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar en tu actividad"
          />
        </label>

        <section className="activity-list-panel">
          <h2>Movimientos</h2>

          {loading && <p>Cargando movimientos...</p>}

          {!loading && message && (
            <p className="form-message error">{message}</p>
          )}

          {!loading && !message && filteredMovements.length === 0 && (
            <p>No encontramos movimientos para mostrar.</p>
          )}

          {!loading &&
            !message &&
            filteredMovements.map((movement, index) => {
              const amount = getMovementAmount(movement);

              return (
                <article className="movement-item" key={movement.id || index}>
                  <span
                    className={`movement-icon ${
                      amount >= 0 ? "income" : "expense"
                    }`}
                  >
                    {amount >= 0 ? "+" : "−"}
                  </span>

                  <div className="movement-info">
                    <strong>{getMovementDescription(movement)}</strong>
                    <small>{formatDate(getMovementDate(movement))}</small>
                  </div>

                  <strong
                    className={`movement-amount ${
                      amount >= 0 ? "income" : "expense"
                    }`}
                  >
                    {amount >= 0 ? "+" : "−"} {formatAmount(Math.abs(amount))}
                  </strong>
                </article>
              );
            })}
        </section>
      </section>
    </main>
  );
}