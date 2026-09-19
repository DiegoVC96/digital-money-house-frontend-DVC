function toText(value, fallback = "No disponible") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

export function downloadReceiptPdf({
  title,
  date,
  amount,
  origin,
  destination,
  operation,
  note = "",
}) {
  if (typeof window === "undefined") {
    return false;
  }

  const receiptWindow = window.open(
    "",
    "_blank",
    "popup=yes,width=720,height=820"
  );

  if (!receiptWindow) {
    return false;
  }

  receiptWindow.document.write(`<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Comprobante Digital Money House</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #f1eded; color: #202024; font-family: Arial, sans-serif; }
          main { width: 620px; margin: 36px auto; background: #1d1d23; padding: 34px; }
          header { padding: 20px; background: #b8ff1d; color: #202024; font-size: 24px; font-weight: 800; text-align: center; }
          h1 { margin: 30px 0 8px; color: #b8ff1d; font-size: 28px; }
          .date { margin: 0 0 24px; color: #f4f4f6; }
          section { padding: 26px; border-radius: 10px; background: #fff; }
          .label { color: #6b6b74; font-size: 14px; }
          .amount { display: block; margin: 6px 0 20px; font-size: 28px; font-weight: 800; }
          .row { padding: 16px 0; border-top: 1px solid #d9d9df; }
          .row strong, .row span { display: block; margin-top: 5px; }
          footer { margin-top: 24px; color: #d8d8dc; font-size: 12px; text-align: center; }
          @media print { body { background: #fff; } main { margin: 0 auto; } }
        </style>
      </head>
      <body>
        <main>
          <header>DIGITAL MONEY HOUSE</header>
          <h1 id="title"></h1>
          <p id="date" class="date"></p>
          <section>
            <span class="label">Monto</span>
            <strong id="amount" class="amount"></strong>
            <div class="row"><span class="label">Origen</span><strong id="origin"></strong></div>
            <div class="row"><span class="label">Destino</span><strong id="destination"></strong></div>
            <div class="row"><span class="label">Código de operación</span><strong id="operation"></strong></div>
          </section>
          <footer id="note"></footer>
        </main>
      </body>
    </html>`);

  const values = {
    title: toText(title, "Comprobante"),
    date: toText(date),
    amount: toText(amount),
    origin: toText(origin),
    destination: toText(destination),
    operation: toText(operation),
    note: toText(note, "Digital Money House"),
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = receiptWindow.document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  });

  receiptWindow.document.close();
  receiptWindow.focus();
  window.setTimeout(() => receiptWindow.print(), 250);

  return true;
}
