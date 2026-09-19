"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../services/authService";
import {
  getAccount,
  getAccountActivity,
} from "../../services/accountService";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useSessionErrorHandler } from "../../hooks/useSessionErrorHandler";
import { useCurrentUserName } from "../../hooks/useCurrentUserName";

const ITEMS_PER_PAGE = 10;

function getMovementDate(movement) {
  return movement.dated || movement.date || movement.created_at || "";
}

function getMovementDescription(movement) {
  return (
    movement.description ||
    movement.name ||
    movement.concept ||
    movement.type ||
    "Movimiento"
  );
}

function getMovementAmount(movement) {
  return Number(movement.amount ?? movement.total ?? movement.value ?? 0);
}

function isIncome(movement) {
  return getMovementAmount(movement) >= 0;
}

export default function ActivityPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const handleSessionError = useSessionErrorHandler();
  const userName = useCurrentUserName(token, isReady);
  const [menuOpen, setMenuOpen] = useState(false);
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [operation, setOperation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    async function loadActivity() {
      setMessage("");
      try {
        const account = await getAccount(token);
        const response = await getAccountActivity(token, account.id);

        const activity = Array.isArray(response)
          ? response
          : response.activities || response.data || [];

        const ordered = [...activity].sort(
          (a, b) => new Date(getMovementDate(b)) - new Date(getMovementDate(a))
        );

        setMovements(ordered);
      } catch (error) {
  if (handleSessionError(error)) {
    return;
  }

  setMessage(
    error instanceof Error
      ? error.message
      : "No pudimos cargar los movimientos."
  );
} finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [handleSessionError, isReady, token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, period, operation]);

  const filteredMovements = useMemo(() => {
    const text = search.trim().toLowerCase();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return movements.filter((movement) => {
      const date = new Date(getMovementDate(movement));
      const searchableText = [
        getMovementDescription(movement),
        movement.origin,
        movement.destination,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !text || searchableText.includes(text);

      let matchesPeriod = true;

      if (period === "today") {
        matchesPeriod = date >= today;
      }

      if (period === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        matchesPeriod = date >= yesterday && date < today;
      }

      if (period === "week") {
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        matchesPeriod = date >= start;
      }

      if (period === "fifteenDays") {
        const start = new Date(today);
        start.setDate(today.getDate() - 15);
        matchesPeriod = date >= start;
      }

      if (period === "month") {
        const start = new Date(today);
        start.setMonth(today.getMonth() - 1);
        matchesPeriod = date >= start;
      }

      if (period === "threeMonths") {
        const start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        matchesPeriod = date >= start;
      }

      const matchesOperation =
        operation === "all" ||
        (operation === "income" && isIncome(movement)) ||
        (operation === "expense" && !isIncome(movement));

      return matchesSearch && matchesPeriod && matchesOperation;
    });
  }, [movements, search, period, operation]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMovements.length / ITEMS_PER_PAGE)
  );

  const visibleMovements = filteredMovements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function formatAmount(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  }

  function formatDate(value) {
    if (!value) return "Sin fecha";

    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function clearFilters() {
    setSearch("");
    setPeriod("all");
    setOperation("all");
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
    <main className="dashboard-page activity-page">
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
          <Link className="sidebar-link active" href="/activity">Actividad</Link>
          <Link className="sidebar-link" href="/profile">Tu perfil</Link>
          <Link className="sidebar-link" href="/deposit">Cargar dinero</Link>
          <Link className="sidebar-link" href="/services">Pagar servicios</Link>
          <Link className="sidebar-link" href="/cards">Tarjetas</Link>
          <button className="sidebar-link logout-link" type="button" onClick={handleLogout}>
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

        <section className="activity-filters">
          <label>
            Período
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="all">Todos los movimientos</option>
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="week">Última semana</option>
              <option value="fifteenDays">Últimos 15 días</option>
              <option value="month">Último mes</option>
              <option value="threeMonths">Últimos 3 meses</option>
            </select>
          </label>

          <label>
            Operación
            <select value={operation} onChange={(event) => setOperation(event.target.value)}>
              <option value="all">Ingresos y egresos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Egresos</option>
            </select>
          </label>

          <button className="clear-filters-button" type="button" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </section>

        <section className="activity-list-panel">
          <h2>Movimientos</h2>

          {loading && <p>Cargando movimientos...</p>}

          {!loading && message && <p className="form-message error">{message}</p>}

          {!loading && !message && filteredMovements.length === 0 && (
            <p>No encontramos movimientos para mostrar.</p>
          )}

          {!loading && !message && visibleMovements.map((movement, index) => {
            const amount = getMovementAmount(movement);
            const income = isIncome(movement);

            return (
              <button
                className="movement-item movement-button"
                type="button"
                key={movement.id || index}
                onClick={() => setSelectedMovement(movement)}
              >
                <span className={`movement-icon ${income ? "income" : "expense"}`}>
                  {income ? "+" : "−"}
                </span>

                <span className="movement-info">
                  <strong>{getMovementDescription(movement)}</strong>
                  <small>{formatDate(getMovementDate(movement))}</small>
                </span>

                <strong className={`movement-amount ${income ? "income" : "expense"}`}>
                  {income ? "+" : "−"} {formatAmount(Math.abs(amount))}
                </strong>
              </button>
            );
          })}

          {!loading && !message && totalPages > 1 && (
            <div className="activity-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Anterior
              </button>

              <span>
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </section>

      {selectedMovement && (
        <div className="movement-modal-backdrop" role="presentation">
          <section
            className="movement-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="movement-detail-title"
          >
            <button
              className="modal-close-button"
              type="button"
              onClick={() => setSelectedMovement(null)}
              aria-label="Cerrar detalle"
            >
              ×
            </button>

            <h2 id="movement-detail-title">Detalle del movimiento</h2>

            <div className="movement-detail-row">
              <span>Operación</span>
              <strong>{getMovementDescription(selectedMovement)}</strong>
            </div>

            <div className="movement-detail-row">
              <span>Número de operación</span>
              <strong>{selectedMovement.id || "No disponible"}</strong>
            </div>

            <div className="movement-detail-row">
              <span>Fecha</span>
              <strong>{formatDate(getMovementDate(selectedMovement))}</strong>
            </div>

            <div className="movement-detail-row">
              <span>Destino</span>
              <strong>{selectedMovement.destination || "Cuenta Digital Money House"}</strong>
            </div>

            <div className="movement-detail-row">
              <span>Monto</span>
              <strong className={isIncome(selectedMovement) ? "income" : "expense"}>
                {isIncome(selectedMovement) ? "+" : "−"}{" "}
                {formatAmount(Math.abs(getMovementAmount(selectedMovement)))}
              </strong>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
