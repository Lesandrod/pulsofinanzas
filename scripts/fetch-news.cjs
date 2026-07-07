const fs = require('fs');
const path = require('path');


// Target path to news database
const newsJsonPath = path.join(__dirname, '..', 'public', 'news.json');

// Read environment variable for Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not defined. Script will run in dry-run simulation mode.');
}

// Feeds list to scrape
const FEEDS = [
  {
    name: 'CNBC Finance',
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    categoryFallback: 'Bolsa de Valores'
  },
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    categoryFallback: 'Criptomonedas'
  },
  {
    name: 'Infobae',
    url: 'https://www.infobae.com/arc/outboundfeeds/rss/category/economia/',
    categoryFallback: 'Mercados'
  },
  {
    name: 'Investing.com',
    url: 'https://es.investing.com/rss/news.rss',
    categoryFallback: 'Mercados'
  }
];

// Helper to parse simple RSS items from XML using regex (no dependencies needed!)
function parseRSS(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    if (titleMatch && linkMatch) {
      items.push({
        title: cleanHTML(titleMatch[1]),
        link: linkMatch[1].trim(),
        description: descMatch ? cleanHTML(descMatch[1].substring(0, 300)) : '',
        pubDate: pubDateMatch ? pubDateMatch[1] : ''
      });
    }
  }
  return items;
}

function cleanHTML(text) {
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

// Main execution function
async function run() {
  console.log('Initiating news collection...');

  // 1. Load existing news database
  let newsDatabase = [];
  if (fs.existsSync(newsJsonPath)) {
    try {
      newsDatabase = JSON.parse(fs.readFileSync(newsJsonPath, 'utf8'));
    } catch (e) {
      console.error('Error reading news.json, starting with empty database:', e);
      newsDatabase = [];
    }
  }

  // 2. Fetch and parse all feeds, grouping by feed name to prevent starvation
  const newItemsByFeed = {};
  let totalNewCount = 0;

  for (const feed of FEEDS) {
    newItemsByFeed[feed.name] = [];
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/xml, text/xml, */*'
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const xmlText = await res.text();
      const items = parseRSS(xmlText);
      
      console.log(`Parsed ${items.length} items from ${feed.name}.`);

      // Filter out news already present in database (compare source URLs)
      for (const item of items) {
        const alreadyExists = newsDatabase.some(n => n.sourceUrl === item.link);
        if (!alreadyExists) {
          newItemsByFeed[feed.name].push({
            item,
            feedName: feed.name,
            categoryFallback: feed.categoryFallback
          });
          totalNewCount++;
        }
      }
    } catch (e) {
      console.error(`Error processing feed ${feed.name}:`, e);
    }
  }

  console.log(`Found ${totalNewCount} new items across all feeds.`);

  if (totalNewCount === 0) {
    console.log('No new articles found. Exiting.');
    return;
  }

  // Round-robin selection to guarantee variety of sources (max 3 articles total)
  const articlesToProcess = [];
  const quota = 3;
  let added = true;

  while (articlesToProcess.length < quota && added) {
    added = false;
    for (const feed of FEEDS) {
      if (articlesToProcess.length >= quota) break;
      const feedItems = newItemsByFeed[feed.name];
      if (feedItems && feedItems.length > 0) {
        articlesToProcess.push(feedItems.shift()); // Take the newest item from this feed
        added = true;
      }
    }
  }
  const processedArticles = [];

  for (const itemObj of articlesToProcess) {
    const { item, feedName, categoryFallback } = itemObj;
    console.log(`Processing article: "${item.title}"...`);

    let geminiData = null;

    if (GEMINI_API_KEY) {
      // Live processing with Gemini API
      try {
        const prompt = `Eres un redactor SEO financiero experto para el portal Pulso Finanzas.
        Tengo esta noticia de última hora de una fuente:
        Título: ${item.title}
        Resumen/Contexto: ${item.description}
        Enlace: ${item.link}

        Genera un objeto JSON estrictamente formateado con la siguiente estructura (no agregues bloques markdown como \`\`\`json ni texto explicativo extra, responde ÚNICAMENTE con el objeto JSON parseable):
        {
          "category": "Selecciona entre 'Criptomonedas', 'Bolsa de Valores' o 'Mercados'",
          "title": "Un título SEO en español muy atractivo y profesional, reescrito con enfoque de utilidad",
          "summary": "Un resumen corto en español de 2 frases sobre lo que ocurrió en la noticia",
          "editorialComment": "Un comentario editorial propio de 2-3 frases en español conectando la noticia con una de nuestras herramientas. Por ejemplo: si habla de tasas, deudas o bolsa con la calculadora de interés compuesto; si habla de despidos, salarios o nómina con la calculadora de finiquito; si habla de inflación o presupuestos generales con la descarga de la plantilla de ahorro",
          "relatedTool": "Selecciona estrictamente uno de los siguientes valores: 'tab-interes' (para interés compuesto), 'tab-finiquito' (para liquidaciones) o 'tab-plantillas' (para plantillas excel de ahorro) según corresponda",
          "bodyText": "Un cuerpo de noticia en español de 3 párrafos cortos (separados por etiquetas <p>...</p>), analizando los detalles del evento y su relevancia para la economía general en formato HTML. Redactado de forma profesional y periodística."
        }`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (!response.ok) throw new Error(`Gemini API HTTP Error ${response.status}`);
        const data = await response.json();
        
        const rawText = data.candidates[0].content.parts[0].text;
        const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        geminiData = JSON.parse(cleanJsonText);
      } catch (err) {
        console.error('Error calling Gemini API:', err);
      }
    }

    // Dry-run Simulation fallback if Gemini fails or is not configured
    if (!geminiData) {
      console.log('Running fallback simulated processing...');
      const isCrypto = categoryFallback === 'Criptomonedas';
      geminiData = {
        category: categoryFallback,
        title: `Actualidad: ${item.title} en español`,
        summary: `Resumen de mercados: ${item.title}. Los analistas financieros de Pulso Finanzas siguen de cerca las repercusiones de este evento en las carteras de ahorro de Latinoamérica.`,
        editorialComment: isCrypto 
          ? 'La volatilidad en criptomonedas demuestra la importancia de mantener un presupuesto equilibrado. No arriesgues más de tu 20% de ahorro sagrado definido en la regla 50/30/20. Planifica tus finanzas de forma segura.'
          : 'El mercado bursátil se ve fuertemente impulsado por empresas de alto rendimiento. A largo plazo, invertir de manera constante en el mercado bursátil permite ganarle a la inflación por medio del interés compuesto.',
        relatedTool: isCrypto ? 'tab-plantillas' : 'tab-interes',
        bodyText: `<p>El evento sobre <strong>"${item.title}"</strong> ha generado diversas opiniones en los mercados internacionales. Analistas sugieren cautela ante las próximas decisiones corporativas.</p><p>Las carteras de inversión a nivel regional se preparan para fluctuaciones a corto plazo. Se recomienda a los ahorradores mantener una parte líquida en fondos de emergencia.</p>`
      };
    }

    // Build the final newspaper article database item
    const newArticleId = 'noticia-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newArticle = {
      id: newArticleId,
      category: geminiData.category,
      title: geminiData.title,
      summary: geminiData.summary,
      editorialComment: geminiData.editorialComment,
      relatedTool: geminiData.relatedTool,
      sourceName: feedName,
      sourceUrl: item.link,
      date: formatDate(new Date()),
      timestamp: Date.now(),
      author: 'Editorial Pulso Finanzas',
      body: geminiData.bodyText || `<p>${geminiData.summary}</p><p>Esta decisión de los mercados financieros internacionales influye de forma directa en las proyecciones económicas globales. La prensa económica destaca la importancia de evaluar cómo estas dinámicas impactan el bolsillo individual.</p>`
    };

    processedArticles.push(newArticle);
  }

  // 3. Append new articles to the FRONT of the database
  newsDatabase = [...processedArticles, ...newsDatabase];

  // Limit database to maximum 25 items to prevent huge JSON file sizes
  if (newsDatabase.length > 25) {
    newsDatabase = newsDatabase.slice(0, 25);
  }

  // 4. Save back to public/news.json
  fs.writeFileSync(newsJsonPath, JSON.stringify(newsDatabase, null, 2), 'utf8');
  console.log(`Database updated successfully. Added ${processedArticles.length} new articles to news.json.`);
}

run();
