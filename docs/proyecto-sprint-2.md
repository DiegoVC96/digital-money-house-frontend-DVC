# Proyecto Sprint 2 — Dashboard, perfil, actividad y tarjetas

## Objetivo

Extender Digital Money House con un área privada para usuarios autenticados. El Sprint incorpora visualización de saldo, actividad, perfil, CVU, alias y administración de tarjetas.

## Funcionalidades implementadas

### Dashboard

- Visualización del saldo disponible en pesos argentinos.
- Nombre real del usuario autenticado.
- Accesos a tarjetas y CVU.
- Búsqueda dentro de la actividad.
- Últimos movimientos de la cuenta.
- Menú lateral para navegar por el área privada.
- Diseño responsive para escritorio y móvil.

### Perfil

- Consulta de datos reales del usuario.
- Edición y persistencia de datos personales.
- Edición y persistencia del alias.
- Validación del alias con tres palabras separadas por puntos.
- Visualización de CVU y alias.
- Botones para copiar CVU y alias.
- Acceso a medios de pago.

### Actividad

- Consulta de movimientos desde el backend.
- Ordenamiento por fecha.
- Búsqueda por descripción.
- Estado vacío cuando no existen movimientos.

### Tarjetas

- Consulta de tarjetas asociadas.
- Formulario para agregar tarjetas.
- Detección visual de Visa, Mastercard y American Express según el número.
- Validación de número, vencimiento, titular y código de seguridad.
- El vencimiento se envía al backend con formato `MM/AAAA`.
- Visualización de los últimos cuatro dígitos.
- Eliminación de tarjetas.
- Límite de diez tarjetas por cuenta.
- Estado vacío cuando no hay tarjetas asociadas.

## Integración con backend

Se utilizaron los siguientes recursos del backend:

- `GET /api/account`
- `GET /api/users/{userId}`
- `PATCH /api/users/{userId}`
- `PATCH /api/accounts/{accountId}`
- `GET /api/accounts/{accountId}/activity`
- `GET /api/accounts/{accountId}/cards`
- `POST /api/accounts/{accountId}/cards`
- `DELETE /api/accounts/{accountId}/cards/{cardId}`

Las solicitudes de cuenta, perfil, actividad y tarjetas utilizan el token sin el prefijo `Bearer`, según el comportamiento requerido por el backend.

## Pruebas realizadas

### Pruebas manuales

- Dashboard muestra nombre y saldo reales.
- Perfil consulta y actualiza datos reales.
- Alias actualizado y persistido correctamente.
- Alta de tarjeta Visa de prueba validada.
- Tarjeta creada mostrada con sus últimos cuatro dígitos.
- Eliminación de tarjeta validada.
- Actividad muestra correctamente el estado vacío.
- Diseño móvil y menú hamburguesa validados.

### Pruebas automatizadas

- `npm run build`: compilación aprobada.
- `npm run test:e2e`: 6 pruebas aprobadas.
- `npm run test:selenium`: prueba aprobada.

Las pruebas de Playwright cubren Sprint 1 y los flujos de dashboard y tarjetas de Sprint 2 utilizando respuestas simuladas, sin modificar datos reales.

## Resultado

El Sprint 2 incorpora un dashboard privado funcional y conectado al backend, con gestión de perfil, actividad y tarjetas, además de una interfaz responsive alineada con los diseños provistos.