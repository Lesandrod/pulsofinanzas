# 📖 Guía de Continuidad: Pulso Finanzas

Este documento sirve como hoja de ruta para continuar el desarrollo y despliegue del proyecto en casa. Contiene el historial de lo realizado y los pasos exactos que faltan para poner el sitio web en producción.

---

## 📊 Estado Actual del Proyecto

### ✅ Tareas Completadas (Lo que ya hicimos)

- [x] **Migración a Astro:** Estructuramos el sitio en Astro v4.15.0 bajo Node v20, logrando compilaciones estáticas ultra rápidas en la carpeta `/dist`.
- [x] **Rebranding Completo ("Pulso Finanzas"):** Reemplazamos todas las menciones del antiguo nombre "CalculaTodo" por la nueva marca carmesí **Pulso Finanzas** (logos, títulos SEO, pies de página, comentarios de código).
- [x] **Conexión Real con Gemini 2.5 Flash:**
  - Creamos el archivo local `.env` con tu clave de API de Gemini.
  - Actualizamos el endpoint del script a `gemini-2.5-flash` para evitar el error 404.
  - Probamos la traducción e ingesta real, generando noticias 100% en español con análisis financiero único.
- [x] **Algoritmo de Ingesta Equitativa (Round-Robin):** Evitamos la dominancia de un solo periódico. El robot toma 1 noticia de CNBC, 1 de Yahoo, 1 de Infobae, etc., hasta llenar el cupo.
- [x] **Colección de 5 Herramientas / Calculadoras:**
  - [x] Calculadora de Liquidación y Finiquito laboral.
  - [x] Calculadora de Interés Compuesto con gráfico interactivo y proyecciones.
  - [x] Calculadora Express de Presupuesto 50/30/20.
  - [x] Calculadora de Pérdida por Inflación (con enlace de redirección al interés compuesto).
  - [x] Centro de descargas de plantillas Excel (.csv) con temporizador circular de 5 segundos.
- [x] **Colección de 5 Guías de Ahorro y Educación:**
  - [x] Regla del 50/30/20.
  - [x] Método de la Bola de Nieve para deudas.
  - [x] 5 Gastos Hormiga que destruyen tu presupuesto.
  - [x] ¿Cuánto ahorrar para ser millonario a los 60 años?
  - [x] ¿Qué pasa si invierto en bolsa a 10 años?
- [x] **Enlaces y Navegación Consistentes:** Integramos todas las calculadoras en el pie de página, barra lateral de noticias y redireccionamientos dinámicos mediante hashes (ej: `/herramientas#tab-interes`).

---

## 🚀 Tareas Pendientes (Siguientes Pasos)

Sigue estos pasos en tu computadora de casa para publicar el sitio en internet y activar la automatización:

### 1. Inicializar Git y Crear Repositorio
- [ ] Abre tu terminal en la carpeta del proyecto en casa:
  ```bash
  cd /ruta/a/tu/proyecto/calculatodo
  ```
- [ ] Inicializa Git y realiza tu primer commit:
  ```bash
  git init
  git add .
  git commit -m "feat: inicializar Pulso Finanzas con Astro y Gemini"
  ```
- [ ] Crea un repositorio vacío en tu cuenta de GitHub con el nombre `pulso-finanzas` (déjalo como público o privado).
- [ ] Vincula tu repositorio local con GitHub y sube el código:
  ```bash
  git branch -M main
  git remote add origin https://github.com/TU_USUARIO_GITHUB/pulso-finanzas.git
  git push -u origin main
  ```

### 2. Configurar el Secreto de API en GitHub (Seguridad)
El archivo `.env` está en el `.gitignore` para que tu clave secreta de Gemini nunca se suba públicamente a GitHub. Para que el robot en la nube pueda usarla:
- [ ] En tu repositorio de GitHub, ve a la pestaña **Settings** (Configuración).
- [ ] En el menú izquierdo, busca **Secrets and variables** -> **Actions**.
- [ ] Haz clic en el botón **New repository secret**.
- [ ] Rellena los campos:
  * **Name:** `GEMINI_API_KEY`
  * **Value:** `TU_CLAVE_DE_GEMINI_AQUI` *(tu clave de Gemini)*
- [ ] Presiona **Add secret**.

### 3. Conectar y Desplegar en Vercel o Netlify (Hosting Gratis)
- [ ] Crea una cuenta gratuita en [Vercel](https://vercel.com/) o [Netlify](https://www.netlify.com/) usando tu cuenta de GitHub.
- [ ] Haz clic en **Add New** -> **Project** e importa tu repositorio `pulso-finanzas`.
- [ ] En la configuración del build, Vercel detectará Astro automáticamente. Deja los comandos por defecto (`npm run build`, salida en `dist`).
- [ ] Presiona **Deploy**. Tu sitio estará en línea en un subdominio gratuito en menos de 1 minuto (ej: `pulso-finanzas.vercel.app`).

### 4. Automatizar la Ingesta de Noticias
- [ ] El archivo `.github/workflows/fetch-news.yml` ya está programado para correr de forma invisible en GitHub Actions cada 4 horas. Ejecutará el scraper con tu clave, redactará 3 noticias con Gemini, las guardará en `news.json` y volverá a compilar tu web de forma 100% automática sin que tengas que hacer nada.

### 5. Colocar Google AdSense
- [ ] Cuando Google apruebe tu sitio para AdSense, copia el script de anuncios automáticos y pégalo dentro de la etiqueta `<head>` del archivo `src/layouts/Layout.astro` (línea 20). Los banners y el modal intersticial se mostrarán solos.

---

## ⚡ Acordeón de Comandos Útiles (Terminal local)

* **Encender el servidor local de pruebas:**
  ```bash
  npm run dev
  ```
  *(Luego abres en tu navegador: http://localhost:4321/)*

* **Probar la ingesta de noticias localmente con tu clave:**
  ```bash
  node --env-file=.env scripts/fetch-news.cjs
  ```

* **Compilar el sitio para producción en local:**
  ```bash
  npm run build
  ```
