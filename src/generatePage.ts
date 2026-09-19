import type { PropertyData, TemplateStyle } from './types'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function nl2p(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

function formatPrice(price: string, negotiable: boolean): string {
  const digits = price.replace(/[^\d]/g, '')
  if (!digits) return negotiable ? 'Cena do negocjacji' : 'Cena na zapytanie'
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${formatted} zł${negotiable ? ' (do negocjacji)' : ''}`
}

const PALETTES: Record<TemplateStyle, { accent: string; accentDark: string; bg: string; font: string }> = {
  elegancki: { accent: '#b08d57', accentDark: '#7c6239', bg: '#faf8f5', font: "'Georgia', 'Times New Roman', serif" },
  nowoczesny: { accent: '#2563eb', accentDark: '#1e3a8a', bg: '#f5f7fb', font: "'Helvetica Neue', Arial, sans-serif" },
  rustykalny: { accent: '#7a5230', accentDark: '#4e3320', bg: '#f6f1e7', font: "'Palatino Linotype', Georgia, serif" },
  wlasny: { accent: '#b08d57', accentDark: '#7c6239', bg: '#f7f7f7', font: "'Helvetica Neue', Arial, sans-serif" },
}

export function generatePropertyPage(data: PropertyData): string {
  const basePalette = PALETTES[data.template]
  const palette =
    data.template === 'wlasny'
      ? { ...basePalette, accent: data.brandAccent || basePalette.accent, accentDark: data.brandAccentDark || basePalette.accentDark }
      : basePalette
  const title = data.title.trim() || 'Dom na sprzedaż'
  const heroPhoto = data.photos[0]?.dataUrl
  const galleryPhotos = data.photos.slice(1)

  const rawStats: [string, string][] = [
    ['Powierzchnia', data.area ? `${data.area} m²` : ''],
    ['Działka', data.plotArea ? `${data.plotArea} m²` : ''],
    ['Pokoje', data.rooms],
    ['Łazienki', data.bathrooms],
    ['Piętro', data.floor],
    ['Rok budowy', data.yearBuilt],
    ['Ogrzewanie', data.heating],
  ]
  const statList = rawStats.filter(([, value]) => value.trim() !== '')

  const statsHtml = statList
    .map(
      ([label, value]) => `
        <div class="stat">
          <span class="stat-value">${escapeHtml(value)}</span>
          <span class="stat-label">${escapeHtml(label)}</span>
        </div>`
    )
    .join('')

  const featuresHtml = data.features.length
    ? `<ul class="features">${data.features
        .map((f) => `<li>${escapeHtml(f)}</li>`)
        .join('')}</ul>`
    : ''

  const galleryHtml = galleryPhotos.length
    ? `
    <section class="gallery">
      <h2>Galeria zdjęć</h2>
      <div class="gallery-grid">
        ${galleryPhotos
          .map(
            (p) => `
          <figure>
            <img src="${p.dataUrl}" alt="${escapeHtml(p.caption || title)}" loading="lazy" />
            ${p.caption ? `<figcaption>${escapeHtml(p.caption)}</figcaption>` : ''}
          </figure>`
          )
          .join('')}
      </div>
    </section>`
    : ''

  const locationLine = [data.address, data.city].filter(Boolean).map(escapeHtml).join(', ')

  const contactHtml = `
    <section class="contact">
      <h2>Kontakt</h2>
      <div class="contact-card">
        ${data.contactName ? `<p class="contact-name">${escapeHtml(data.contactName)}</p>` : ''}
        ${data.contactPhone ? `<p><a href="tel:${escapeHtml(data.contactPhone.replace(/\s+/g, ''))}">📞 ${escapeHtml(data.contactPhone)}</a></p>` : ''}
        ${data.contactEmail ? `<p><a href="mailto:${escapeHtml(data.contactEmail)}">✉️ ${escapeHtml(data.contactEmail)}</a></p>` : ''}
        ${data.contactPhone ? `<a class="cta" href="tel:${escapeHtml(data.contactPhone.replace(/\s+/g, ''))}">Zadzwoń i umów prezentację</a>` : ''}
      </div>
    </section>`

  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}${locationLine ? ` — ${locationLine}` : ''}</title>
<meta name="description" content="${escapeHtml(data.description.slice(0, 155))}" />
<style>
  :root {
    --accent: ${palette.accent};
    --accent-dark: ${palette.accentDark};
    --bg: ${palette.bg};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ${palette.font};
    background: var(--bg);
    color: #24292f;
    line-height: 1.6;
  }
  .hero {
    position: relative;
    min-height: 60vh;
    background: ${heroPhoto ? `url('${heroPhoto}') center/cover no-repeat` : 'linear-gradient(135deg, var(--accent), var(--accent-dark))'};
    display: flex;
    align-items: flex-end;
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05));
  }
  .hero-content {
    position: relative;
    z-index: 1;
    padding: 2.5rem 1.5rem;
    color: #fff;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }
  .hero-content h1 { margin: 0 0 0.5rem; font-size: clamp(1.8rem, 4vw, 2.8rem); }
  .hero-location { opacity: 0.9; margin: 0 0 1rem; font-size: 1.05rem; }
  .hero-price {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    padding: 0.5rem 1.25rem;
    border-radius: 999px;
    font-weight: bold;
    font-size: 1.2rem;
  }
  main { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  section { margin-bottom: 2.5rem; }
  h2 {
    color: var(--accent-dark);
    border-bottom: 2px solid var(--accent);
    padding-bottom: 0.4rem;
    font-size: 1.4rem;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  .stat {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .stat-value { display: block; font-size: 1.3rem; font-weight: bold; color: var(--accent-dark); }
  .stat-label { display: block; font-size: 0.85rem; color: #57606a; margin-top: 0.25rem; }
  .description p { margin: 0 0 1rem; }
  .features {
    list-style: none;
    padding: 0;
    margin: 1rem 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  .features li {
    background: #fff;
    border: 1px solid var(--accent);
    color: var(--accent-dark);
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    font-size: 0.9rem;
  }
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  .gallery-grid figure { margin: 0; }
  .gallery-grid img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 10px;
    display: block;
  }
  .gallery-grid figcaption { font-size: 0.85rem; color: #57606a; margin-top: 0.35rem; }
  .contact-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .contact-name { font-weight: bold; font-size: 1.1rem; margin: 0 0 0.5rem; }
  .contact-card a { color: var(--accent-dark); text-decoration: none; }
  .cta {
    display: inline-block;
    margin-top: 1rem;
    background: var(--accent);
    color: #fff !important;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: bold;
  }
  footer {
    text-align: center;
    padding: 1.5rem;
    font-size: 0.8rem;
    color: #8b949e;
  }
</style>
</head>
<body>
  <div class="hero">
    <div class="hero-content">
      <h1>${escapeHtml(title)}</h1>
      ${locationLine ? `<p class="hero-location">📍 ${locationLine}</p>` : ''}
      <span class="hero-price">${formatPrice(data.price, data.priceNegotiable)}</span>
    </div>
  </div>
  <main>
    ${statList.length ? `<section class="stats-section"><div class="stats">${statsHtml}</div></section>` : ''}
    ${data.description.trim() ? `<section class="description"><h2>Opis nieruchomości</h2>${nl2p(data.description)}</section>` : ''}
    ${data.features.length ? `<section class="features-section"><h2>Udogodnienia</h2>${featuresHtml}</section>` : ''}
    ${galleryHtml}
    ${data.contactName || data.contactPhone || data.contactEmail ? contactHtml : ''}
  </main>
  <footer>Strona wygenerowana w generatorze ofert nieruchomości</footer>
</body>
</html>`
}
