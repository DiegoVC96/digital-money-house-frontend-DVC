# Proyecto Sprint 3 – Ingreso de dinero y actividad

## Objetivo

Implementar el flujo de ingreso de dinero a la billetera Digital Money House, permitiendo cargar saldo desde una tarjeta asociada o consultar los datos necesarios para transferir desde otra cuenta. También se amplió la sección de actividad con filtros, detalle de movimientos y paginación.

## Funcionalidades implementadas

### Ingreso desde tarjeta

- Pantalla para elegir el medio de ingreso.
- Listado y selección de tarjetas asociadas.
- Ingreso y validación del monto.
- Resumen previo a la confirmación.
- Registro del depósito mediante la API.
- Comprobante de ingreso con monto, origen, destino, CVU, fecha y código de operación.
- Visualización del depósito en la actividad de la cuenta.

### Ingreso desde otra cuenta

- Consulta del CVU y alias reales de la cuenta.
- Botones para copiar ambos datos al portapapeles.
- Mensaje de confirmación después de copiar.

### Actividad

- Búsqueda por descripción, origen o destino.
- Filtros por período: hoy, ayer, última semana, últimos 15 días, último mes y últimos 3 meses.
- Filtros por tipo de operación: ingresos y egresos.
- Opción para limpiar filtros.
- Paginación de 10 movimientos por página.
- Modal con detalle de operación, número, fecha, destino y monto.

## Integración con API

Se utilizaron los siguientes recursos del backend:

- `GET /api/account`
- `GET /api/accounts/{account_id}/cards`
- `POST /api/accounts/{account_id}/deposits`
- `GET /api/accounts/{account_id}/activity`

La autenticación usa el token almacenado localmente, enviado en el encabezado `Authorization` sin el prefijo `Bearer`, según el requerimiento del backend.

## Pruebas realizadas

| Tipo | Resultado |
| --- | --- |
| Flujo manual de ingreso desde tarjeta | Aprobado |
| Depósito real de $100,00 | Aprobado |
| Comprobante de ingreso | Aprobado |
| Consulta y copiado de CVU y alias | Aprobado |
| Filtros y detalle de actividad | Aprobado |
| Pruebas E2E con Playwright | 9 aprobadas |
| Prueba Selenium de autenticación | Aprobada |
| Compilación de producción | Aprobada |

## Rutas incorporadas

- `/deposit`
- `/deposit/cards`
- `/deposit/amount`
- `/deposit/confirm`
- `/deposit/success`
- `/deposit/external`

## Resultado

El Sprint 3 queda implementado, integrado con el backend, probado manualmente y validado con pruebas automatizadas.