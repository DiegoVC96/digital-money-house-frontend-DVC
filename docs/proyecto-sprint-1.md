# Proyecto Digital Money House

## Objetivo del proyecto

Desarrollar el frontend de una billetera virtual llamada Digital Money House. La aplicación permite que una persona conozca los servicios de la billetera, cree una cuenta, inicie sesión y cierre su sesión.

## Objetivo del Sprint 1

Construir una aplicación responsive con Next.js que incluya una landing page, registro de usuario, login en dos pasos, persistencia de sesión y cierre de sesión.

El frontend consume la API REST provista por Digital House para registrar usuarios, iniciar sesión y cerrar sesión.

## Backlog del Sprint 1

| ID | Actividad | Estado |
| --- | --- | --- |
| US-01 | Crear landing page responsive con accesos a registro y login | Completado |
| US-02 | Crear formulario de registro con validaciones | Completado |
| US-03 | Conectar registro con `POST /api/users` | Completado |
| US-04 | Crear login en dos pantallas | Completado |
| US-05 | Conectar login con `POST /api/login` | Completado |
| US-06 | Guardar el token y proteger la ruta `/home` | Completado |
| US-07 | Implementar logout con `POST /api/logout` | Completado |
| US-08 | Crear casos de prueba manuales | Completado |
| US-09 | Automatizar controles críticos con Playwright | Completado |
| US-10 | Desplegar la aplicación en Vercel | Completado |

## Planificación

| Etapa | Actividades | Tiempo estimado |
| --- | --- | --- |
| Análisis | Revisar la consigna y los endpoints del backend | 1 día |
| Desarrollo | Landing, registro, login, sesión y logout | 4 días |
| Testing | Casos manuales y pruebas automatizadas | 2 días |
| Infraestructura | Repositorio, documentación y deploy en Vercel | 1 día |

## Informe de entrega

El Sprint 1 incluye:

- Landing page responsive.
- Registro de usuario conectado al backend.
- Validaciones de campos y mensajes de error.
- Login en dos pasos.
- Token guardado en `localStorage`.
- Ruta `/home` protegida para usuarios autenticados.
- Cierre de sesión con eliminación del token.
- Casos de prueba manuales clasificados en Smoke y Regression.
- Cuatro pruebas automatizadas con Playwright.
- Deploy público en Vercel.

## Enlaces

- Repositorio: https://gitlab.com/DiegoVC96/digital-money-house-frontend-dvc
- Aplicación desplegada: https://digital-money-house-frontend-dvc.vercel.app/

## Retrospectiva personal

Durante este Sprint aprendí a estructurar una aplicación con Next.js y a reemplazar el enrutado de React Router por el App Router. También practiqué el consumo de una API REST, el manejo de respuestas de error, el uso de `localStorage` para conservar una sesión y la protección de rutas privadas.
La parte más desafiante fue conectar el flujo de login en dos pasos con el token de autenticación. Lo resolví separando las pantallas de email y contraseña, y validando la sesión antes de permitir el acceso a `/home`.

## Lecciones aprendidas

- Conviene revisar los endpoints del backend antes de crear formularios.
- Las validaciones del frontend mejoran la experiencia, pero el backend siempre debe validar los datos.
- Guardar el token permite mantener la sesión al recargar la página.
- Las rutas protegidas evitan mostrar contenido privado sin una sesión válida.
- Las pruebas automatizadas ayudan a detectar errores luego de modificar el código.
- Un deploy temprano permite verificar el funcionamiento de la aplicación fuera del entorno local.