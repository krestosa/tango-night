# Noche de Tango — SushiClub

Landing de campaña estática, responsive y lista para publicar en hosting HTTP(S) sin compilación ni dependencias de JavaScript. Inspirada en **Sushi Libre 2** de \`Codex/sushilibre\`: hero a pantalla completa, titulares editoriales de gran escala, bloques gastronómicos y dock de reserva fijo. No arrastra sus productos, precios ni lógica de fechas.

## Abrir y publicar
- Abrir \`index.html\` en el navegador o publicar directamente todo este directorio en la raíz de un sitio estático.
- Publicar juntos \`index.html\`, \`styles/\`, \`scripts/\` y \`assets/\`. Las rutas son relativas.
- No requiere npm, servidor API, Node.js ni compilación. Requiere conexión solamente para cargar Inter desde Google Fonts; existe fallback del sistema.
- Botones de reserva: enlace real al canal oficial de SushiClub, definido en \`scripts/config.js\`.

## Sistema de diseño
- \`styles/tokens.css\`: fuente única de colores, tipografía, escala de espaciado 4px, radios, tiempos y curva de animación.
- \`styles/base.css\`: reset accesible, utilitarios de grilla y jerarquía tipográfica.
- \`styles/components.css\`: arquitectura de secciones, cards, menú, reservas y dock.
- \`styles/responsive.css\`: adaptaciones de 1300, 1100, 960, 760, 640 y 375 px.
- `styles/motion.css`: secuencia de entrada del hero, revelados de secciones, feedback de botones, acordeones y animación de imágenes, con hover exclusivo para mouse.
- `styles/mobile-polish.css`: composición de titulares para 320–640 px, safe areas, jerarquía móvil, dimensiones táctiles y dock.
- Grilla: 12 columnas desktop, 6 tablet, 4 mobile. Shell fluid con ancho máximo de 1576px y gutter centralizado.
- Tipografía única: **Inter** de Google Fonts (fallback Arial). Los títulos contorneados utilizan un interlineado ampliado para impedir superposiciones.
- Animaciones respetan `prefers-reduced-motion`; FAQ accesible con HTML nativo, y navegación móvil accesible con JavaScript.

## Datos de producción que faltan, SIN inventarlos
La descripción inicial no incluye los locales adheridos, las fechas ni los horarios de cada función. La landing **se puede navegar y reservar** desde el sistema oficial sin afirmar disponibilidad inventada. En \`scripts/config.js\`, completar \`events\` solamente con funciones confirmadas, especificando \`format: "minimal"\` (música, sin baile) o \`format: "essential"\` (música y danza). Los eventos se mostrarán automáticamente en la sección de reservas.

La redacción de las bebidas sigue la información recibida. Es recomendable obtener confirmación del segundo consumo incluido antes de una publicación comercial definitiva.

## Recursos / fotografías
- \`assets/sushiclub.svg\`: logo reutilizado del proyecto local Sushi Libre.
- \`assets/hero-tango.jpg\`: fotografía de Paul / Unsplash, "A couple dances the tango with passion" — https://unsplash.com/photos/Y-y6cUTQ2YA
- \`assets/essential-tango.jpg\`: fotografía de Nikolay Koshnicharov / Unsplash — https://unsplash.com/photos/GbQS0B13ORg
- \`assets/intimate-tango.jpg\`: fotografía de Earl McKenzie / Unsplash — https://unsplash.com/photos/DnOEguLf_lY
- \`assets/sushi.jpg\`: fotografía de Nahima Aparicio / Unsplash — https://unsplash.com/photos/_vGfJ3J884g

Las fotografías son recursos atmosféricos ilustrativos; **no deben presentarse como integrantes ni actuaciones reales de Tango Raíz**. Para producción de marca definitiva, reemplazarlas por material autorizado de Tango Raíz y piezas fotografiadas de SushiClub. El copy explicita este carácter ilustrativo en el pie de página.

## Notas de interacción
- Menú móvil accesible, cierre por Escape y por navegación.
- Menú móvil accesible con transición interrumpible usando Web Animations API; cierre inmediato con Escape, navegación e inert/aria-hidden.
- Barra de progreso de lectura con requestAnimationFrame.
- Agenda segura: usa textContent y valida URLs HTTPS; evita HTML inyectado.
- FAQ nativo (details/summary), cierre de preguntas previas.
- El sitio no solicita ni recopila datos personales.
