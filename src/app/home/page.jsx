"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { logoutUser } from "../../services/authService";
import {
  getAccount,
  getAccountActivity,
  getUser,
} from "../../services/accountService";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useSessionErrorHandler } from "../../hooks/useSessionErrorHandler";

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

export default function HomePage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const handleSessionError = useSessionErrorHandler();
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
  if (!isReady || !token) {
    return;
  }

  async function loadDashboard() {
    try {
      const accountData = await getAccount(token);
      const [userData, activityResponse] = await Promise.all([
        getUser(token, accountData.user_id),
        getAccountActivity(token, accountData.id),
      ]);

      const activity = Array.isArray(activityResponse)
        ? activityResponse
        : activityResponse.activities || activityResponse.data || [];

      const orderedActivity = [...activity]
        .sort(
          (a, b) =>
            new Date(getMovementDate(b)) - new Date(getMovementDate(a))
        )
        .slice(0, 10);

      setAccount(accountData);
      setUser(userData);
      setActivities(orderedActivity);
    } catch (error) {
  if (handleSessionError(error)) {
    return;
  }

  setMessage(
    error instanceof Error
      ? error.message
      : "No pudimos actualizar tu información."
  );
}
  }

  loadDashboard();
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

  const filteredActivities = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return activities;

    return activities.filter((activity) =>
      getMovementDescription(activity)
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [activities, search]);

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

  const fullName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
    : "usuario";

  if (!isReady) {
    return null;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <Link className="dashboard-user" href="/home">
          <span className="dashboard-avatar">MB</span>
          <span>Hola, {fullName}</span>
        </Link>
      </header>

      <aside className={`dashboard-sidebar ${menuOpen ? "open" : ""}`}>
        <nav aria-label="Navegación principal">
          <Link className="sidebar-link active" href="/home">Inicio</Link>
          <Link className="sidebar-link" href="/activity">Actividad</Link>
          <Link className="sidebar-link" href="/profile">Tu perfil</Link>
          <Link className="sidebar-link" href="/deposit">Cargar dinero</Link>
          <Link className="sidebar-link" href="/services">
            Pagar servicios
          </Link>
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

      <section className="dashboard-content">
        {message && (
          <p className="form-message error" role="alert">
            {message}
          </p>
        )}
        <section className="balance-panel">
          <div>
            <p>Dinero disponible</p>
            <strong>{formatAmount(account?.available_amount || 0)}</strong>
          </div>

          <div className="balance-links">
            <Link href="/cards">Ver tarjetas</Link>
            <Link href="/profile">Ver CVU</Link>
          </div>
        </section>

        <section className="quick-actions" aria-label="Acciones rápidas">
          <Link href="/deposit/external">Transferir dinero</Link>
          <Link href="/services">Pago de servicios</Link>
        </section>

        <label className="activity-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Buscar en tu actividad"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <section className="activity-panel">
          <h1>Tu actividad</h1>

          <div className="activity-list">
            {filteredActivities.length === 0 && (
              <p>No encontramos movimientos para mostrar.</p>
            )}

            {filteredActivities.map((activity, index) => {
              const amount = getMovementAmount(activity);

              return (
                <article className="activity-item" key={activity.id || index}>
                  <span className="activity-dot" aria-hidden="true" />

                  <p>{getMovementDescription(activity)}</p>

                  <div>
                    <strong>
                      {amount >= 0 ? "+" : "−"}{" "}
                      {formatAmount(Math.abs(amount))}
                    </strong>
                    <small>{formatDate(getMovementDate(activity))}</small>
                  </div>
                </article>
              );
            })}
          </div>

          <Link className="all-activity-link" href="/activity">
            Ver toda tu actividad <span aria-hidden="true">→</span>
          </Link>
        </section>
      </section>

      <footer className="dashboard-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}
