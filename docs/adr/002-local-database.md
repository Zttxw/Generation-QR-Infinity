# ADR 002: Base de Datos Local en Electron

## Contexto
La aplicación (V1.0) requiere almacenar el historial de códigos QR generados y organizarlos en proyectos localmente, sin depender de un servidor externo. Se requiere transaccionalidad y robustez para datos locales.

## Decisión
Se utilizará `better-sqlite3` (SQLite nativo) gestionado a través de `electron-vite`.

## Consecuencias
- **Positivas:** Robusto, transaccional, estándar maduro para almacenamiento de datos locales.
- **Negativas:** `better-sqlite3` requiere compilación de bindings nativos (C++) que pueden ser problemáticos al integrarse con empaquetadores web modernos puros.
- **Mitigación:** Al usar `electron-vite`, los binarios nativos de Node se externalizan y empaquetan correctamente para el proceso Main (Main Process) por defecto, resolviendo este riesgo sin configuraciones de Webpack/Rollup complejas.
