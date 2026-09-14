import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <main className="auth-page success-page">
      <header className="auth-header login-header">
        <Link className="brand" href="/" aria-label="Digital Money House">
          DMH
        </Link>
      </header>

      <section className="success-content">
        <h1>Registro Exitoso</h1>

        <div className="success-check" aria-hidden="true">
          ✓
        </div>

        <p>
          Hemos enviado un correo de confirmación para validar tu email,
          <br />
          por favor revisalo para iniciar sesión.
        </p>

        <Link className="success-button" href="/verification">
          Continuar
        </Link>
      </section>

      <footer className="auth-footer">
        © 2022 Digital Money House
      </footer>
    </main>
  );
}