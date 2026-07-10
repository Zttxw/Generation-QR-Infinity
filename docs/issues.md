# Plan de Tareas (to-issues) - qr-eterno V1.0

A continuación se desglosa el PRD en *vertical slices* (cortes verticales). Cada issue abarca desde la capa de base de datos (Main) hasta la UI (Renderer), garantizando que al cerrar un issue se entrega una funcionalidad completa y testeable.

---

## Issue 1: Fundación de Base de Datos y Gestión de Proyectos
**Objetivo:** Establecer la conexión inicial con SQLite y permitir la creación y listado de Proyectos.
**Backend (Main):**
- Configurar la conexión con `better-sqlite3`.
- Crear migración/esquema inicial para la tabla `projects` (id, nombre, created_at).
- Crear handlers IPC: `db:get-projects`, `db:create-project`, `db:delete-project`.
**Frontend (Renderer):**
- Crear la vista principal (Dashboard).
- Crear componente UI para listar proyectos con acción de eliminación (incluye modal de confirmación de borrado en cascada).
- Crear formulario/modal simple para crear un nuevo proyecto.
**Criterios de Aceptación:**
- [ ] La app levanta sin errores de base de datos nativa.
- [ ] Se pueden crear y eliminar proyectos (el borrado limpia la tabla asociada en cascada).
- [ ] **Borrado Seguro:** Si un proyecto tiene QRs asociados, intentar eliminarlo debe detenerse y mostrar un diálogo de confirmación explícito y obligatorio en la UI (advirtiendo que el borrado es irreversible) antes de proceder con el borrado en cascada.
- [ ] La UI se ve limpia y moderna (Dark mode base).

---

## Issue 2: Entidad QR y Generación Estática (Core)
**Objetivo:** Permitir la creación de un QR estático básico asignado a un proyecto.
**Backend (Main):**
- Crear tabla `qrs` (id, nombre, url, project_id, created_at).
- Crear handlers IPC: `db:create-qr`, `db:get-qrs-by-project`.
**Frontend (Renderer):**
- Vista interna de un Proyecto (lista sus QRs).
- Formulario de creación de QR: Input para Nombre y URL.
- Validación estricta: URL máximo 250 caracteres.
- Componente de renderizado en vivo usando `qrcode.react` (forzando SVG nativo y Nivel H).
**Criterios de Aceptación:**
- [ ] No permite URLs de más de 250 caracteres.
- [ ] El QR renderizado en pantalla es un nodo `<svg>` puro, no un Canvas.
- [ ] El QR creado se guarda en la base de datos y aparece en la lista del proyecto.

---

## Issue 3: Personalización Visual (Colores y Logo Local)
**Objetivo:** Implementar la personalización gráfica respetando la regla 100% offline.
**Backend (Main):**
- Añadir campos a tabla `qrs` (color_fg, color_bg, logo_path).
- Crear handler IPC: `fs:select-logo` (Abre un diálogo nativo del OS para elegir una imagen, la copia a `local_uploads/` de forma segura, y devuelve la ruta local).
**Frontend (Renderer):**
- Añadir selectores de color (foreground/background) al formulario de QR.
- Añadir botón "Seleccionar Logo" que llame a `fs:select-logo`.
- Actualizar el componente `qrcode.react` para pasar la prop `imageSettings` con la imagen local elegida y los colores.
**Criterios de Aceptación:**
- [ ] Los logos elegidos se copian a la carpeta `/local_uploads`. Durante la copia, el archivo debe renombrarse automáticamente utilizando un identificador único (ej. `UUID.ext`) para asegurar que dos logos distintos con el mismo nombre no se sobreescriban silenciosamente.
- [ ] El QR muestra el logo al centro sin perder legibilidad (gracias al nivel H).
- [ ] Los colores personalizados se aplican y guardan correctamente en BD.

---

## Issue 4: Edición de Metadatos (Regla de Inmutabilidad)
**Objetivo:** Permitir organizar los QRs sin romper la inmutabilidad del destino.
**Backend (Main):**
- Añadir campo `notas` a tabla `qrs`.
- Crear handler IPC: `db:update-qr-metadata` (Actualiza nombre, notas, project_id) y `db:delete-qr`.
**Frontend (Renderer):**
- Vista de "Edición/Detalle de QR".
- Permite editar nombre, notas, mover a otro proyecto, y eliminar el QR permanentemente.
- **Validación crítica:** El campo de la URL está bloqueado/disabled. Si el usuario quiere cambiar la URL, debe haber un botón "Duplicar" o crear uno nuevo.
**Criterios de Aceptación:**
- [ ] El usuario puede guardar notas internas, cambiar nombres y eliminar QRs sin afectar los demás.
- [ ] Resulta imposible modificar la URL codificada de un QR existente desde la interfaz.

---

## Issue 5: Sistema de Exportación (Individual y Batch)
**Objetivo:** Materializar los QRs en archivos físicos (SVG/PNG) para el usuario.
**Backend (Main):**
- Crear handler IPC: `fs:export-qrs` (Recibe una lista de objetos {nombre, svgString, pngDataURL} y un directorio destino, y escribe los archivos a disco).
**Frontend (Renderer):**
- Botón "Exportar (SVG/PNG)" en el detalle del QR.
- Botón "Exportar Todos" en la vista del Proyecto.
- Lógica de renderizado offscreen para convertir el SVG a PNG vía Canvas en memoria antes de enviar el buffer al proceso Main.
**Criterios de Aceptación:**
- [ ] Exportar en batch 10 QRs no congela permanentemente la UI (manejo asíncrono).
- [ ] El SVG exportado es vectorial perfecto.
- [ ] Los PNGs exportados tienen resolución suficiente para uso estándar.
