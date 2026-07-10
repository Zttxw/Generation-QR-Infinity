# ADR 001: Librería de Generación QR

## Contexto
Necesitamos generar códigos QR estáticos en una aplicación Electron + React. Los requisitos clave son:
- Soporte para SVG nativo (para impresión de alta calidad).
- Soporte para exportación en PNG (rasterizado rápido).
- Soporte para colores básicos y un logo central.

## Decisión
Se utilizará la librería `qrcode.react`.
**Se forzará el uso de renderizado en SVG (`renderAs="svg"`)** para garantizar que el DOM contenga nodos vectoriales puros, cumpliendo el requisito estricto de no utilizar Canvas para la salida principal.
**Se forzará el Nivel de Corrección de Errores a "H" (High):** Debido a que la aplicación permite incrustar un logo en el centro del código (lo cual obstruye píxeles), el QR debe soportar hasta un 30% de recuperación de datos para asegurar su legibilidad bajo cualquier condición.

## Consecuencias
- **Positivas:** Calidad de impresión perfecta gracias al SVG real. El logo y colores son manejados nativamente por la librería mediante la propiedad `imageSettings`.
- **Negativas:** La exportación a PNG requerirá un paso intermedio (serializar el SVG a DataURL, dibujarlo en un Canvas en memoria y extraer el PNG), añadiendo un poco de complejidad a la lógica de exportación. Esto es un trade-off aceptable en pro de tener el SVG original limpio.
