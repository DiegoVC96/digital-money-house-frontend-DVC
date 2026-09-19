# Digital Money House

Aplicación web de una billetera virtual desarrollada con Next.js. El proyecto reúne los flujos funcionales de los sprints 1 a 4: autenticación, perfil, tarjetas, ingresos de dinero, actividad y pago de servicios.

## Ejecutar el proyecto

### Opción 1: Node.js

Requisitos:

- Node.js 20.9 o superior.
- Acceso a internet para consumir la API académica.

```bash
git clone https://github.com/DiegoVC96/digital-money-house-frontend-DVC.git
cd digital-money-house-frontend-DVC
npm ci
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

No se requiere crear un archivo `.env` para ejecutar la aplicación.

### Opción 2: Docker

Requisito: Docker Desktop instalado y en ejecución.

```bash
git clone https://github.com/DiegoVC96/digital-money-house-frontend-DVC.git
cd digital-money-house-frontend-DVC
docker compose up --build
```

Abrí [http://localhost:3001](http://localhost:3001).

Para detener los contenedores:

```bash
docker compose down
```

## Validaciones

Para ejecutar las pruebas end-to-end se necesita Google Chrome instalado.

```bash
npm run test:e2e
```

Resultado validado actualmente: **13 pruebas E2E aprobadas**.

Para generar la compilación de producción:

```bash
npm run build
```

## Funcionalidades

### Sprint 1

- Página de inicio.
- Registro y verificación demostrativa.
- Inicio de sesión en dos pasos.
- Recuperación de contraseña demostrativa.
- Protección de rutas privadas.

### Sprint 2

- Dashboard con saldo y actividad reciente.
- Perfil de usuario, CVU y alias.
- Listado, alta y eliminación de tarjetas.
- Actividad de la cuenta.

### Sprint 3

- Ingreso de dinero desde tarjeta asociada.
- Ingreso mediante CVU o alias desde otra cuenta.
- Confirmación y comprobante de ingreso.
- Detalle y filtros de movimientos.

### Sprint 4

- Búsqueda de servicios.
- Validación del número de cuenta según el proveedor.
- Selección de medio de pago.
- Manejo de saldo insuficiente.
- Confirmación y resultado demostrativo del pago.

## Arquitectura y seguridad

- Next.js 16 y React 19.
- Servicios separados de las pantallas y contextos para autenticación y borradores temporales.
- Token de sesión y datos temporales solo en memoria: no se persisten en `localStorage` ni `sessionStorage`.
- Validación de entradas antes de avanzar en los flujos.
- Encabezados de seguridad: CSP, protección contra framing, `nosniff`, política de referentes, permisos restringidos y aislamiento de ventanas.
- Imagen Docker multietapa con ejecución mediante usuario sin privilegios.

## Nota sobre el backend

La API académica permite gestionar cuentas, tarjetas, depósitos y movimientos. No expone un endpoint para liquidar pagos ante proveedores de servicios.

Por esa razón, el catálogo de servicios y su resultado exitoso se ejecutan en **modo demostración**. La aplicación no crea una transacción genérica para fingir un pago real, porque eso podría modificar el saldo sin confirmar el pago ante la empresa.

## Documentación de entrega

- [Sprint 1](docs/proyecto-sprint-1.md)
- [Sprint 2](docs/proyecto-sprint-2.md)
- [Sprint 3](docs/proyecto-sprint-3.md)
- [Sprint 4](docs/proyecto-sprint-4.md)
- [Plan de pruebas Sprint 4](outputs/sprint-4-testing/plan-pruebas-sprint-4.xlsx)

## Despliegue de imagen en AWS

La imagen generada por Docker Compose utiliza el nombre `dmh-frontend:latest` por defecto. Para publicarla en Amazon ECR se debe etiquetar con la URL del repositorio ECR y subirla después de autenticarse mediante AWS CLI.

```bash
docker tag dmh-frontend:latest <cuenta>.dkr.ecr.<region>.amazonaws.com/dmh-frontend:latest
docker push <cuenta>.dkr.ecr.<region>.amazonaws.com/dmh-frontend:latest
```

Reemplazá `<cuenta>` y `<region>` por los datos de la cuenta AWS destino.
