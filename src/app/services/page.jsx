"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../services/authService";
import { getServices } from "../../services/serviceService";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useSessionErrorHandler } from "../../hooks/useSessionErrorHandler";

function normalizeServices(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.services)) {
    return response.services;
  }

  return [];
}

function getServiceInitials(name) {
  return String(name || "Servicio")
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ServicesPage() {
  const router = useRouter();
  const { token, isReady } = useRequireAuth();
  const { endSession } = useAuth();
  const handleSessionError = useSessionErrorHandler();

  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        setMessage("");

        const response = await getServices();
        setServices(normalizeServices(response));
      } catch (error) {
        if (handleSessionError(error)) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "No pudimos cargar los servicios."
        );
      } finally {
        setLoading(false);
      }
    }

    if (isReady && token) {
      loadServices();
    }
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

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return services;
    }

    return services.filter((service) =>
      String(service.name || "")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [search, services]);

  if (!isReady) {
    return null;
  }

  return (
    <main className="dashboard-page services-page">
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
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
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
          <Link className="sidebar-link" href="/deposit">
            Cargar dinero
          </Link>
          <Link className="sidebar-link active" href="/services">
            Pagar servicios
          </Link>
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

      <section className="services-content">
        <label className="activity-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Buscá entre más de 5.000 empresas"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <section className="services-list-panel">
          <h1>Más recientes</h1>
            <p className="service-demo-notice">
              Servicios de demostración
            </p>

          {loading && <p>Cargando servicios...</p>}

          {!loading && message && (
            <p className="form-message error" role="alert">
              {message}
            </p>
          )}

          {!loading && !message && filteredServices.length === 0 && (
            <p>No encontramos servicios con ese nombre.</p>
          )}

          {!loading &&
            !message &&
            filteredServices.map((service) => (
              <article className="service-item" key={service.id}>
                <span className="service-icon" aria-hidden="true">
                  {getServiceInitials(service.name)}
                </span>

                <p>{service.name}</p>

                <Link
                  href={`/services/${encodeURIComponent(String(service.id))}`}
                >
                  Seleccionar
                </Link>
              </article>
            ))}
        </section>
      </section>

      <footer className="dashboard-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}