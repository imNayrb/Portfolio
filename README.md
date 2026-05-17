# Portfolio Personale — [Il Tuo Nome]

Portfolio professionale ultra-moderno, ottimizzato per GitHub Pages.

## Stack

- HTML5 semantico + ARIA
- CSS3 (custom properties, glassmorphism, animazioni)
- JavaScript Vanilla ES2022 (no dipendenze)
- Font: Inter + JetBrains Mono (Google Fonts)

## Struttura repo

```
Portfolio/
├── index.html              # Entry point SPA
├── css/
│   └── style.css           # Tutti gli stili (design system completo)
├── js/
│   └── main.js             # Logica, animazioni, sicurezza form
├── assets/
│   ├── images/             # Foto, screenshot progetti, favicon
│   │   └── favicon.svg
│   └── videos/             # Video mockup progetti
├── _headers                # Header sicurezza per Netlify/Cloudflare Pages
└── README.md
```

## Deploy su GitHub Pages

1. Vai su **Settings → Pages** del repo
2. Source: `Deploy from a branch` → branch `main` → folder `/ (root)`
3. Salva. Il sito sarà su `https://tuousername.github.io/portfolio`

## Personalizzazione rapida

Cerca e sostituisci nel codice:

| Placeholder | Sostituisci con |
|---|---|
| `[Il Tuo Nome]` | Il tuo nome e cognome |
| `[La tua città]` | La tua città |
| `tuousername` | Il tuo username GitHub |
| `tuoprofilo` | Il tuo profilo LinkedIn |
| `tua@email.com` | La tua email |
| `YOUR_FORMSPREE_ID` | Il tuo ID da formspree.io |
| `YN` | Le tue iniziali |

## Form contatti (Formspree)

1. Registrati su formspree.io (gratuito fino a 50 msg/mese)
2. Crea un form e copia l'endpoint: `https://formspree.io/f/XXXXXXXX`
3. Sostituisci `YOUR_FORMSPREE_ID` nell'attributo `action` del form in `index.html`

## Sicurezza implementata

- **XSS**: sanitizzazione input lato JS prima dell'invio
- **Clickjacking**: `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`
- **Tab-nabbing**: `rel="noopener noreferrer"` su tutti i link `target="_blank"`
- **Spam**: honeypot field nascosto nel form
- **API key**: nessuna chiave nel codice — form via Formspree (server-side)
- **CSP**: header configurato in `_headers` (Netlify/Cloudflare Pages)