# PRD: Generador de QR Eterno (V1.0)

## 1. Visión y Objetivo
Una aplicación de escritorio para áreas organizacionales (contabilidad, tesorería) que permite generar códigos QR estáticos inmutables. El destino codificado no expira nunca ya que no depende de ningún servidor intermedio de redirección de terceros. La versión 1.0 es puramente local e independiente.

## 2. Alcance (In Scope - V1.0)
- **Generación de QR estático:** Creación de QR donde el contenido (estrictamente URLs) se codifica directamente en la imagen, forzando la salida a formato SVG real.
- **Organización en Proyectos:** Agrupación de los QRs generados dentro de proyectos nombrados.
- **Historial local:** Almacenamiento y persistencia del historial en una base de datos local (SQLite).
- **Gestión y Edición de Metadatos:** Edición del nombre del QR, notas y asignación de proyecto (aclaración: esto no modifica el destino URL ni regenera el gráfico). Incluye también la **eliminación definitiva** de proyectos y de QRs.
- **Personalización Visual:** Capacidad para definir colores básicos y embeber un logo en el centro del QR. (Aclaración: El archivo del logo se seleccionará estrictamente desde el sistema de archivos local del usuario, no mediante URLs remotas, para garantizar el funcionamiento 100% offline).
- **Exportación de Archivos:** 
  - Formatos soportados: SVG (para impresión de alta calidad) y PNG.
  - Modos de exportación: Individual y por Lote (Batch) para extraer todos los QRs de un proyecto simultáneamente.

## 3. Fuera de Alcance (Out of Scope - Reservado para V1.5+)
- Componentes de automatización (Agentes).
- Comunicación con servidor remoto o backend propio.
- Dashboard administrativo web.
- Heartbeat, telemetría, métricas o analíticas de uso.
- Sincronización remota o en la nube entre diferentes instalaciones de la app.
- Funciones integradas de backup/restore de la base de datos (el usuario es responsable de hacer backup de su propia PC).
- Soporte para texto libre o vCards (restringido a URLs para mantener el QR legible y con baja densidad visual).

## 4. Restricciones Técnicas (Stack)
- **Plataforma:** Aplicación de Escritorio multiplataforma (Windows/Mac/Linux).
- **Core / Tooling:** Electron, React, Vite (orquestado por `electron-vite`).
- **Librería de Generación QR:** `qrcode.react` configurada explícitamente para emitir `SVG` (`renderAs="svg"`).
- **Almacenamiento Local:** `better-sqlite3` corriendo exclusivamente en el proceso Main de Electron.

## 5. Criterios de Éxito
- La aplicación se puede instalar y usar de inicio a fin sin conexión a internet.
- La densidad del QR está controlada: El sistema restringe el input a URLs con un máximo estricto de 250 caracteres, asegurando que la matriz de puntos del QR mantenga una baja densidad y sea altamente legible.
- El gráfico SVG exportado es un gráfico vectorial real y escalable de forma infinita sin perder resolución.
- La funcionalidad "Batch Export" descarga los archivos físicos a un directorio seleccionado sin trabar la interfaz de usuario.
