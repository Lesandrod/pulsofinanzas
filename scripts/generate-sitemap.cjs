const fs = require('fs');
const path = require('path');

const newsJsonPath = path.join(__dirname, '../public/news.json');
const sitemapXmlPath = path.join(__dirname, '../public/sitemap.xml');
const distSitemapXmlPath = path.join(__dirname, '../dist/sitemap.xml');

const siteUrl = 'https://pulsofinanzas.info';

// Static routes
const pages = [
  '',
  '/herramientas',
  '/guias',
  '/contacto',
  '/politica-privacidad',
  '/terminos-condiciones'
];

try {
  const newsData = JSON.parse(fs.readFileSync(newsJsonPath, 'utf8'));
  newsData.forEach(article => {
    pages.push(`/noticias/${article.id}`);
  });
} catch (e) {
  console.warn('Error reading news.json for sitemap generation:', e);
}

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

pages.forEach(page => {
  xml += '  <url>\n';
  xml += `    <loc>${siteUrl}${page}</loc>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>' + (page === '' ? '1.0' : page.startsWith('/noticias/') ? '0.8' : '0.6') + '</priority>\n';
  xml += '  </url>\n';
});

xml += '</urlset>\n';

// Write to public folder (source)
fs.writeFileSync(sitemapXmlPath, xml, 'utf8');
console.log('Sitemap generated successfully at public/sitemap.xml!');

// Write to dist folder (production build) if it exists
try {
  const distDir = path.join(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distSitemapXmlPath, xml, 'utf8');
    console.log('Sitemap copied to dist/sitemap.xml!');
  }
} catch (e) {
  console.warn('Could not write sitemap to dist directory:', e);
}
