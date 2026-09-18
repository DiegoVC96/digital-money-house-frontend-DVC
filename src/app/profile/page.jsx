"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser } from "../../services/authService";
import {
  getAccount,
  getUser,
  updateAlias,
  updateUser,
} from "../../services/accountService";

const emptyProfile = {
  email: "",
  fullname: "",
  dni: "",
  phone: "",
  alias: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const accountData = await getAccount(token);
        const userData = await getUser(token, accountData.user_id);

        setAccount(accountData);
        setProfile({
          email: userData.email ?? "",
          fullname: `${userData.firstname ?? ""} ${userData.lastname ?? ""}`.trim(),
          dni: String(userData.dni ?? ""),
          phone: userData.phone ?? "",
          alias: accountData.alias ?? "",
        });
        setAllowed(true);
      } catch (requestError) {
        setMessage(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem("token");

    try {
      await logoutUser(token);
    } finally {
      localStorage.removeItem("token");
      router.push("/");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  }

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");

    if (!/^[^.]+\.[^.]+\.[^.]+$/.test(profile.alias)) {
      setMessage("El alias debe tener tres palabras separadas por puntos.");
      return;
    }

    const token = localStorage.getItem("token");
    const [firstname, ...lastNameParts] = profile.fullname.trim().split(/\s+/);

    try {
      setSaving(true);

      await Promise.all([
        updateUser(token, account.user_id, {
          email: profile.email,
          firstname: firstname ?? "",
          lastname: lastNameParts.join(" "),
          dni: Number(profile.dni),
          phone: profile.phone,
        }),
        updateAlias(token, account.id, profile.alias),
      ]);

      setEditing(false);
      setMessage("Cambios guardados correctamente.");
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function copyValue(label, value) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1800);
  }

  if (loading) {
    return <main className="dashboard-page">Cargando perfil...</main>;
  }

  if (!allowed || !account) {
    return (
      <main className="dashboard-page">
        <p className="profile-loading-error">
          {message || "No fue posible cargar el perfil."}
        </p>
      </main>
    );
  }

  return (
    <main className="dashboard-page profile-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>

        <Link className="dashboard-user" href="/home">
          <span className="dashboard-avatar">MB</span>
          <span>Hola, {profile.fullname || "usuario"}</span>
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
          <Link className="sidebar-link active" href="/profile">Tu perfil</Link>
          <Link className="sidebar-link" href="/deposit">Cargar dinero</Link>
          <button className="sidebar-link" type="button">Pagar servicios</button>
          <Link className="sidebar-link" href="/cards">Tarjetas</Link>
          <button className="sidebar-link logout-link" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <section className="profile-content">
        <form className="profile-card" onSubmit={handleSave}>
          <div className="profile-card-title">
            <h1>Tus datos</h1>

            <button
              className="profile-edit-button"
              type="button"
              onClick={() => {
                setEditing(!editing);
                setMessage("");
              }}
            >
              {editing ? "Cancelar" : "Editar"}
            </button>
          </div>

          <label className="profile-row">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              readOnly={!editing}
            />
          </label>

          <label className="profile-row">
            <span>Nombre y apellido</span>
            <input
              name="fullname"
              value={profile.fullname}
              onChange={handleChange}
              readOnly={!editing}
            />
          </label>

          <label className="profile-row">
            <span>DNI</span>
            <input
              name="dni"
              value={profile.dni}
              onChange={handleChange}
              readOnly={!editing}
            />
          </label>

          <label className="profile-row">
            <span>Teléfono</span>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              readOnly={!editing}
            />
          </label>

          <div className="profile-row">
            <span>Contraseña</span>
            <strong>******</strong>
          </div>

          {editing && (
            <button className="profile-save-button" disabled={saving} type="submit">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          )}

          {message && <p className="profile-status" role="alert">{message}</p>}
        </form>

        <Link className="payment-methods-link" href="/cards">
          <span>Gestioná los medios de pago</span>
          <span aria-hidden="true">→</span>
        </Link>

        <section className="account-data-card">
          <p>Copia tu CVU o alias para ingresar o transferir dinero desde otra cuenta</p>

          <div className="account-data-row">
            <div>
              <h2>CVU</h2>
              <span>{account.cvu}</span>
            </div>
            <button
              type="button"
              aria-label="Copiar CVU"
              onClick={() => copyValue("CVU", account.cvu)}
            >
              ⧉
            </button>
          </div>

          <div className="account-data-row">
            <div>
              <h2>Alias</h2>
              <input
                name="alias"
                value={profile.alias}
                onChange={handleChange}
                readOnly={!editing}
              />
            </div>
            <button
              type="button"
              aria-label="Copiar alias"
              onClick={() => copyValue("Alias", profile.alias)}
            >
              ⧉
            </button>
          </div>

          {copied && <p className="copy-message">{copied} copiado.</p>}
        </section>
      </section>

      <footer className="dashboard-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}