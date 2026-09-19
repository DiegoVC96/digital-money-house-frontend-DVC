# Proyecto Sprint 4 — Pago de servicios

## Objetivo

Incorporar el flujo de pago de servicios para que la persona usuaria pueda buscar una empresa, ingresar un identificador de cuenta, elegir un medio de pago y consultar el resultado de la operación.

## Funcionalidades implementadas

- Catálogo local de servicios de demostración: Claro, Personal y Cablevisión.
- Búsqueda en cliente por nombre del servicio.
- Validación específica del identificador requerido por cada empresa.
- Selección entre saldo disponible y tarjetas asociadas.
- Pantalla de confirmación con el importe y medio de pago seleccionados.
- Manejo de saldo insuficiente antes de continuar.
- Pantalla de resultado demostrativa y retorno a inicio o listado de servicios.
- Descarga del comprobante mediante el diálogo nativo para guardar como PDF.
- Navegación responsive integrada con el dashboard existente.

## Arquitectura

- `src/services/serviceService.js` concentra el catálogo temporal y el acceso a servicios.
- `src/context/ServicePaymentContext.tsx` conserva el borrador de pago solo en memoria durante el flujo.
- Cada pantalla cubre una etapa única: listado, dato de cuenta, medio de pago, confirmación, error o resultado.
- Las rutas protegidas usan el contexto de autenticación existente y redirigen a inicio de sesión cuando no hay sesión activa.

## Infraestructura

- Se generó un archivo Docker Compose para ejecutar la aplicación en un entorno de contenedores.
- Se generó una imagen Docker del frontend preparada para su despliegue en infraestructura cloud de AWS.
- La imagen permite mantener un entorno de ejecución consistente entre desarrollo, validación y despliegue.
- El archivo `Dockerfile` utiliza una construcción multietapa y ejecuta el contenedor como un usuario sin privilegios.
- El archivo `.dockerignore` evita incluir dependencias locales, resultados de pruebas, documentación y posibles archivos de entorno en la imagen.

### Ejecución local

```bash
docker compose up --build
```

La aplicación queda disponible en `http://localhost:3000`.

### Publicación de la imagen

La imagen generada se identifica como `dmh-frontend:latest` por defecto. Para publicar en AWS Elastic Container Registry, se debe etiquetar con la URL del repositorio ECR y subirla después de autenticarse con AWS CLI.

## Seguridad

- No se guarda token, información de tarjetas ni datos del pago en `localStorage` o `sessionStorage`.
- El identificador de cuenta se normaliza a dígitos y se valida por longitud antes de avanzar.
- El saldo se valida en la interfaz para evitar intentar un pago cuando no hay fondos suficientes.
- No se usa `dangerouslySetInnerHTML`; los valores dinámicos se renderizan con React.
- El borrador se elimina al finalizar el flujo demostrativo.

## Limitación de backend

La documentación disponible no expone un endpoint para registrar y liquidar pagos ante proveedores de servicios. Por ese motivo, el catálogo y el resultado exitoso funcionan en modo demostración. No se utiliza el endpoint de transacciones genéricas para simular un pago real, ya que eso modificaría el saldo sin confirmar el pago ante la empresa.

## Pruebas realizadas

- Pruebas E2E con Playwright: 13 aprobadas.
- Compilación de producción con Next.js: aprobada.
- Se incluyeron validaciones para búsqueda, identificador de cuenta, saldo insuficiente y confirmación demostrativa del Sprint 4.
