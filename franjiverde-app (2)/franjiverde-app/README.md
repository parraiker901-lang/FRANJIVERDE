# Franjiverde: la app del Elche CF

App web instalable en el móvil. Tiene un botón **Actualizar** que pide al servidor los partidos, la clasificación, los titulares y las noticias de alineaciones.

## Por qué no salían resultados en Netlify

Netlify aloja páginas estáticas y no ejecuta `server.js`. Sin servidor no existe `/api/data`, y la app no tenía de dónde sacar los datos. Ahora la parte de datos va como **función de Netlify** (`netlify/functions/data.js`) y `netlify.toml` la conecta con la dirección `/api/data`.

## Publicar en Netlify

1. Sube la carpeta completa del proyecto a un repositorio de GitHub y conéctalo en Netlify ("Add new site", "Import an existing project"). También sirve la CLI: `npx netlify deploy --prod`. Arrastrar solo la carpeta `public` no publica la función, así que no sirve para esto.
2. Netlify lee `netlify.toml` y no necesitas poner nada más en los ajustes de compilación.
3. En **Site configuration > Environment variables** crea `FOOTBALL_DATA_KEY` con tu clave gratuita de football-data.org. Sin ella la app muestra los datos guardados y lo avisa.
4. Vuelve a desplegar para que la variable se aplique.
5. Comprueba que `https://TU-SITIO.netlify.app/api/data` devuelve un texto JSON. Si ves una página de error, la función no se ha publicado.

## Probarla en tu ordenador

```
cd franjiverde-app
FOOTBALL_DATA_KEY=tu_clave node server.js
```

Abre http://localhost:3000.

Variables opcionales: `PORT`, `SEASON` (por defecto 2026), `TEAM_ID` (si no lo pones, busca al Elche solo).

## Instalarla en el móvil como web

1. Abre la dirección de Netlify en Chrome (Android) o Safari (iPhone).
2. Android: menú de Chrome, "Instalar aplicación". iPhone: Compartir, "Añadir a pantalla de inicio".

## App de Android con Capacitor

Dentro de la app de Android los archivos están en el propio móvil, así que la dirección `/api/data` no existe. Antes de compilar, abre `public/config.js` y pon la dirección de tu sitio:

```
window.API_BASE = 'https://TU-SITIO.netlify.app';
```

Luego, en tu equipo: `npm install`, `npx cap add android`, `npx cap sync` y `npx cap open android`. Capacitor 8 pide Node 22 o superior.

## Qué hace y qué no

- **Partidos, resultados y clasificación**: vienen de football-data.org. Se actualizan al pulsar Actualizar y cada 5 minutos con la app abierta.
- **Noticias y alineaciones**: titulares de Google News y de la web del club. Las que hablan de alineaciones van a la pestaña Alineación. Si el servidor consigue leer el once en la noticia, lo muestra; si no, enseña el titular con su enlace. Ninguna alineación es oficial hasta que la publique el club.
- **Viajes**: abre Airbnb cerca del estadio con tus personas, fechas y precio máximo, y la ruta en coche o transporte público en Google Maps.
- **Avisos**: avisa del próximo partido en casa cuando faltan 4 días o menos, pero solo cuando abres la app. Con la app cerrada haría falta un servicio de notificaciones push, que este proyecto no incluye.
- **Entradas y aficionados visitantes**: no están.
- **Límite de tiempo**: las funciones gratuitas de Netlify cortan a los 10 segundos. Si las noticias tardan, la app muestra las guardadas.

## Archivos

- `lib/data.js`: recogida de datos, común al servidor local y a Netlify.
- `netlify/functions/data.js` y `netlify.toml`: la función y su configuración.
- `server.js`: servidor para probar en tu ordenador.
- `data.fallback.json` (y su copia en `public/`): datos de respaldo.
- `public/`: la app, `config.js`, el instalador, la copia sin conexión y los iconos.
