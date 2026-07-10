# Generador de QR (QR Eterno) - V1.0

Aplicación de escritorio **Offline-First** orientada a la seguridad y la inmutabilidad para la generación estática de códigos QR, diseñada para áreas de contabilidad y tesorería.

## Características Principales
- **Offline-First:** Funciona completamente sin internet y sin dependencias de servicios externos. Base de datos SQLite embebida.
- **Inmutabilidad:** Una vez creado un QR, su URL de destino no puede modificarse por diseño.
- **Gestión por Proyectos:** Agrupa los QRs en proyectos para mayor orden.
- **Personalización Visual:** Soporte para cambiar el color principal y de fondo, y adjuntar un Logo nativo (con prevención de colisiones por UUID).
- **Exportación:** Soporte individual (SVG, PNG) y exportación masiva de proyectos.

## Configuración de Desarrollo (Setup)

Requiere **Node.js** y npm.

1. **Instalar dependencias y módulos nativos:**
   ```bash
   npm install
   ```
   > *Nota:* El proyecto incluye un script `postinstall` que ejecuta `@electron/rebuild` automáticamente sobre `better-sqlite3` para asegurar la paridad del ABI de Node con el motor de Electron.

2. **Levantar el entorno de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Verificación de tipos (Typecheck):**
   ```bash
   npm run typecheck
   ```

## Documentación Técnica

La arquitectura y decisiones están en la carpeta `/docs/`:
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [ADR 001: Generación de QRs Estáticos](./docs/adr/001-qr-generation.md)
- [ADR 002: Base de Datos Local con SQLite](./docs/adr/002-local-database.md)
- [Issues & Vertical Slices](./docs/issues.md)
