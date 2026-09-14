import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing">
      <header className="landing-header">
        <Link className="brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>

        <nav className="landing-actions" aria-label="Acciones principales">
          <Link className="button button-outline" href="/login">
            Ingresar
          </Link>
          <Link className="button button-primary" href="/register">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1>
            De ahora en adelante, hacés
            <br />
            más con tu dinero
          </h1>
          <p>
            Tu nueva <strong>billetera virtual</strong>
          </p>
        </div>
      </section>

      <section className="benefits" aria-label="Beneficios">
        <article className="benefit-card">
          <h2>Transferí dinero</h2>
          <p>
            Desde Digital Money House vas a poder transferir dinero a otras
            cuentas, así como también recibir transferencias y nuclear tu
            capital en nuestra billetera virtual.
          </p>
        </article>

        <article className="benefit-card">
          <h2>Pago de servicios</h2>
          <p>
            Pagá mensualmente los servicios en 3 simples clicks. Fácil, rápido
            y conveniente. Olvidate de las facturas en papel.
          </p>
        </article>
      </section>

      <footer className="landing-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}