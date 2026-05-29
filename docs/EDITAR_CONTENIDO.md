# Guía rápida para editar contenido

## Cambiar teléfono

En `main.js`, edita:

```js
const BRAND = {
  phoneDisplay: '096 739 3585',
  phoneIntl: '593967393585'
};
```

En `index.html`, busca `096 739 3585` y `593967393585` para reemplazarlo en enlaces estáticos.

## Cambiar servicios

En `index.html`, busca la sección:

```html
<section class="section" id="servicios">
```

Cada servicio es un bloque:

```html
<article class="service-card" data-category="...">
```

Puedes cambiar título, descripción, bullets y texto del botón.

## Cambiar casos

Busca:

```html
<section class="section shell cases-section" id="casos">
```

Reemplaza las imágenes SVG por fotos reales. Guarda tus fotos en `assets/` y cambia, por ejemplo:

```html
<img src="assets/case-board.svg" alt="..." />
```

por:

```html
<img src="assets/tablero-real-1.jpg" alt="Tablero eléctrico terminado por TEOD CONTROL" />
```

## Cambiar colores

En `styles.css`, arriba de todo están las variables:

```css
:root {
  --accent: #35d5ff;
  --accent-2: #f8b732;
  --accent-3: #7bf1a8;
}
```

