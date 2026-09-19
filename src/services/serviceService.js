const DEMO_SERVICES = Object.freeze([
  {
    id: "claro",
    name: "Claro",
    accountLength: 10,
    accountLabel: "Número de línea sin el primer 0",
    accountHint: "Ingresá 10 números sin espacios.",
    amount: 1250.5,
  },
  {
    id: "personal",
    name: "Personal",
    accountLength: 10,
    accountLabel: "Número de línea sin el primer 0",
    accountHint: "Ingresá 10 números sin espacios.",
    amount: 1890,
  },
  {
    id: "cablevision",
    name: "Cablevisión",
    accountLength: 11,
    accountLabel: "Número de cuenta sin el primer 2",
    accountHint:
      "Son 11 números sin espacios, sin el “2” inicial. Agregá ceros adelante si tenés menos.",
    amount: 1153.75,
  },
]);

export const serviceSource = "demo";

export async function getServices() {
  return DEMO_SERVICES.map((service) => ({ ...service }));
}

export function getServiceById(serviceId) {
  return (
    DEMO_SERVICES.find((service) => service.id === String(serviceId)) ?? null
  );
}