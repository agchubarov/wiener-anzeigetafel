# Wien U-Bahn Anzeigetafel — Technical Specification

## Project Vision

A **vibe/ambient website** that recreates the iconic Vienna U-Bahn departure board (Anzeigetafel) experience. The board displays **live real-time departure data** for a selected station, rendered with the authentic WU3 segment font, overlaid on a blurred looping video background of a Viennese U-Bahn station (ideally an overground station like those on the U4 or U6). Optional ambient station sounds complete the immersive feel.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Single-Page App (HTML + CSS + vanilla JS/TS)   │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Background Layer                          │  │
│  │  • Looping <video> with CSS blur filter    │  │
│  │  • Optional <audio> for ambient sound      │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Anzeigetafel Component (pure CSS)         │  │
│  │  • WU3 Segments web font (@font-face)      │  │
│  │  • LED-style rendering via CSS             │  │
│  │  • Analog clock (SVG or CSS)               │  │
│  │  • Two departure rows + Gleis indicator    │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Station Selector (slide-out sidebar)      │  │
│  │  • Small ≡ icon, top-right corner          │  │
│  │  • U-Bahn lines grouped: U1–U6             │  │
│  │  • Selecting station → fetches live data   │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Data Layer (JS fetch → Wiener Linien API) │  │
│  │  • Polls every 30s                         │  │
│  │  • Maps API response → board display       │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack — Keeping It Simple

| Layer | Technology | Why |
|---|---|---|
| **Markup** | Single `index.html` | No framework needed; this is a single-screen ambient app |
| **Styling** | **Pure CSS** (or Tailwind via CDN if preferred) | The Tafel is achievable with CSS alone — rounded rect, dark bg, glow effects, grid layout |
| **Logic** | **Vanilla TypeScript** (compiled to JS) or plain JS | Fetch API calls, DOM updates, timer. No framework overhead. |
| **Font** | **WU3 Segments** (`@font-face`, `.ttf`/`.woff2` from GitHub releases) | Authentic U3-style segment display characters |
| **Video BG** | Native `<video>` element with CSS `filter: blur()` | No library needed — just a looping mp4/webm |
| **Audio** | Native `<audio>` element | Optional ambient station sounds, togglable |
| **Build** | **Vite** (optional) | Zero-config dev server + TS compilation. Or skip entirely and use plain JS + any static file server |
| **Hosting** | Any static host (Vercel, Netlify, GitHub Pages) | No backend required (API is called client-side) |

### Why no framework?

This project has: one page, one visual component (the Tafel), one data source, one interaction (station picker). React/Vue/Svelte would be overkill. Vanilla JS/TS keeps it fast, tiny, and dependency-free.

### Why not Tailwind?

You *can* use Tailwind (via CDN `<script src="https://cdn.tailwindcss.com">`), but the Tafel styling involves custom effects (LED glow, segment font sizing, rounded housing shape) that are mostly custom CSS anyway. Tailwind would help with the sidebar layout and utility classes but isn't required. **Recommendation: pure CSS with CSS custom properties.**

---

## Data Source: Wiener Linien OGD Realtime API

### API Endpoint

```
GET https://www.wienerlinien.at/ogd_realtime/monitor?rbl={RBL_ID}&sender={SENDER_ID}
```

- **No API key required** (as of 2019, the key requirement was dropped)
- `sender` parameter: can be any identifier string (e.g., your app name)
- `rbl`: the platform/stop ID (RBL-Nummer). Each platform at each station has a unique RBL number
- Returns **JSON** with departures for the next ~70 minutes
- **Fair-use polling interval**: minimum 15 seconds, recommended **30 seconds**
- Multiple RBL IDs can be queried: `?rbl=4259&rbl=4260&sender=myApp`

### CORS Consideration ⚠️

The Wiener Linien API likely does **not** set CORS headers for browser requests. Two options:

1. **Simple CORS proxy** — Use a free proxy like `https://corsproxy.io/` or self-host a tiny one (e.g., Cloudflare Worker, ~10 lines of code)
2. **VT API wrapper** — `http://vtapi.floscodes.net/?station=<NAME>` wraps the official API and allows querying by station name. Rate limit: 1 request per 30 seconds. Check if it sets CORS headers.
3. **Tiny backend proxy** — A 15-line Cloudflare Worker or Vercel Edge Function that proxies the request

**Recommendation**: Start with option 2 (VT API) for simplicity. If it lacks CORS or is unreliable, deploy a small Cloudflare Worker proxy (~free tier).

### Response Structure (simplified)

```json
{
  "data": {
    "monitors": [
      {
        "locationStop": {
          "properties": {
            "title": "Hütteldorfer Straße",
            "attributes": { "rbl": 1450 }
          }
        },
        "lines": [
          {
            "name": "U3",
            "towards": "Simmering",
            "direction": "H",
            "barrierFree": true,
            "departures": {
              "departure": [
                {
                  "departureTime": {
                    "timePlanned": "2025-01-15T14:51:00.000+0100",
                    "timeReal": "2025-01-15T14:51:30.000+0100",
                    "countdown": 3
                  }
                },
                {
                  "departureTime": {
                    "countdown": 8
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

**Key fields for the Tafel:**
- `lines[].name` → Line name (e.g., "U3")
- `lines[].towards` → Destination (e.g., "Ottakring")
- `departures.departure[0].departureTime.countdown` → Minutes until departure
- `departures.departure[1].departureTime.countdown` → Next train after that

### Station/RBL ID Mapping

Each station has multiple RBL IDs (one per platform, per line, per direction). To build the station selector you need a mapping. Options:

1. **Hardcode U-Bahn stations only** — There are ~100 U-Bahn stations across U1–U6. You can maintain a curated JSON file mapping station names → RBL IDs. Find RBL numbers at: [https://till.mabe.at/rbl/](https://till.mabe.at/rbl/)
2. **Download CSV from data.gv.at** — Official CSV files with all stops, lines, and RBL IDs: [Wiener Linien Echtzeitdaten](https://www.data.gv.at/katalog/dataset/wiener-linien-echtzeitdaten-via-datendrehscheibe-wien). Parse and filter for U-Bahn lines.
3. **Use VT API** — Query by station name directly, no RBL mapping needed.

**Recommendation**: Hardcode a curated JSON of U-Bahn stations + RBL IDs. It's ~100 entries, very stable, and avoids runtime CSV parsing. Use [till.mabe.at/rbl/](https://till.mabe.at/rbl/) to look them up.

---

## Font: WU3 Segments

- **Repo**: [github.com/gheja/wu3-segments](https://github.com/gheja/wu3-segments)
- **License**: OFL-1.1 (free to use, including web embedding)
- **Latest release**: v0.13 (Dec 2024)
- **Download**: `.ttf` from the [releases page](https://github.com/gheja/wu3-segments/releases/)
- **Usage**: Convert `.ttf` → `.woff2` (using e.g. `woff2_compress` or an online tool), embed via `@font-face`

```css
@font-face {
  font-family: 'WU3 Segments';
  src: url('./fonts/wu3-segments.woff2') format('woff2'),
       url('./fonts/wu3-segments.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

---

## Anzeigetafel — CSS Design Approach

Based on the reference images, the Tafel has these visual elements:

### Housing
- **Rounded rectangle**, dark/black background
- Slight 3D depth (subtle box-shadow or border)
- Mounted appearance (thin mounting rods — optional decorative CSS)

### Layout (2-row departure display)
```
┌──────┬────────────────────────────────┬─────────┐
│Gleis │  DESTINATION                 ★ │ [CLOCK] │
│  2   │  DESTINATION                  5│         │
└──────┴────────────────────────────────┴─────────┘
```

- **Left**: "Gleis" label + platform number (green/yellow LED text)
- **Center**: Two rows — each showing line name + destination + countdown minutes
- **Right**: Analog clock (optional, SVG or CSS)
- **Star (★)**: Indicates the train is arriving/in station (countdown = 0)
- **Colored bar** behind text: The reference images show green/teal or orange colored bar segments — this can be a subtle `background` gradient strip behind each row

### CSS Techniques
- `font-family: 'WU3 Segments'` for all Tafel text
- Yellow-green text color: `#d4e600` or `#c8e000` (LED yellow-green)
- **Text glow**: `text-shadow: 0 0 8px rgba(200, 224, 0, 0.6)` for LED bloom
- **Scanline effect** (optional): pseudo-element with repeating horizontal lines for CRT/LED realism
- `letter-spacing` tuning for the segment font
- CSS Grid or Flexbox for the row layout
- The colored bar segments (visible in images 4 & 5) can be done with a row of `<span>` elements or a gradient background

### Analog Clock (optional)
- Pure SVG with JS-driven rotation of hour/minute hands
- Or use CSS transforms on `<div>` elements
- Green/yellow face matching the LED aesthetic

---

## Video Background

### Implementation
```html
<video id="bg-video" autoplay muted loop playsinline>
  <source src="./video/station.mp4" type="video/mp4">
</video>
```

```css
#bg-video {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  object-fit: cover;
  filter: blur(12px) brightness(0.5);
  z-index: -1;
}
```

### Video Source Options
You'll need to source or record a looping video of a Viennese U-Bahn station. Good candidates:
- **U4 overground stations** (Heiligenstadt, Spittelau, Friedensbrücke, Schönbrunn) — daylight, riverside views
- **U6 overground sections** — elevated viaduct, nice urban backdrop
- **YouTube Creative Commons** clips of Wien U-Bahn (download + trim)
- **Self-recorded** — best option for quality and licensing

**Format**: MP4 (H.264), 1080p, 15-30 second loop, file size ideally under 10MB for fast loading. Consider using a poster frame for initial load.

### No JS Library Needed
The native `<video>` element handles autoplay, looping, and muting. CSS `filter: blur()` handles the frosted glass effect. No video.js or similar library necessary.

---

## Audio (Optional / Phase 2)

```html
<audio id="ambient" loop>
  <source src="./audio/station-ambience.mp3" type="audio/mpeg">
</audio>
```

- Must be user-initiated (browser autoplay policy) — add a small 🔊 toggle button
- Source: Freesound.org has Vienna metro ambience recordings, or record your own
- Keep file small (128kbps MP3, ~1-2MB for a 1-minute loop)

---

## Station Selector — Slide-out Sidebar

### UX
- **Trigger**: Small hamburger icon (≡) or a subtle Wiener Linien logo in the top-right corner
- **Panel**: Slides in from the right, semi-transparent dark overlay
- **Content**: U-Bahn lines listed (U1, U2, U3, U4, U5, U6), each expandable to show stations
- **Selection**: Tap a station → panel closes → Tafel updates with live data
- **Line colors**: Use official Wiener Linien colors (U1 red, U2 purple, U3 orange, U4 green, U5 turquoise, U6 brown)

### Implementation
Pure CSS `transform: translateX()` transition + a checkbox hack or minimal JS toggle. Station data from a static JSON object in the code.

---

## Project File Structure

```
wien-tafel/
├── index.html
├── style.css
├── app.js              (or app.ts if using Vite)
├── stations.json       (U-Bahn station → RBL ID mapping)
├── fonts/
│   └── wu3-segments.woff2
├── video/
│   └── station.mp4
├── audio/              (optional)
│   └── station-ambience.mp3
└── vite.config.ts      (optional, only if using Vite)
```

**Total files**: ~6-8. Extremely simple.

---

## Data Flow

```
1. Page loads → default station displayed (e.g., Stephansplatz)
2. Fetch departure data from API (via proxy if needed)
3. Parse JSON → extract first 2 departures per direction
4. Render on Tafel:
   Row 1: "{LINE} {DESTINATION}    {COUNTDOWN_1}"
   Row 2: "{LINE} {DESTINATION}    {COUNTDOWN_2}"
5. Update Gleis number
6. Start clock (tick every second)
7. Set interval: re-fetch every 30 seconds
8. On station change: clear display, fetch new data, re-render
```

---

## Open Questions / Decisions

| # | Question | Options | Recommendation |
|---|---|---|---|
| 1 | **CORS proxy** | VT API wrapper / Cloudflare Worker / corsproxy.io | Start with VT API, fallback to CF Worker |
| 2 | **Build tool** | Vite / none (plain files) | Vite if using TS; skip if plain JS |
| 3 | **Show all lines or U-Bahn only?** | U-Bahn only / all Wiener Linien | U-Bahn only (matches the Tafel aesthetic) |
| 4 | **Multiple directions?** | Show both directions / one direction per Tafel | One Tafel per direction, or toggle — TBD |
| 5 | **Video source** | Self-record / CC YouTube / stock | Self-record for best quality |
| 6 | **Audio on/off** | On by default / off with toggle | Off by default, small toggle button |
| 7 | **Colored bar segments** | Replicate the LED bar (complex) / skip | Phase 2 — focus on text first |
| 8 | **Mobile support** | Responsive / desktop-only | Responsive (scale Tafel down) |

---

## Implementation Phases

### Phase 1: Static Tafel + Font
- Set up HTML/CSS
- Embed WU3 Segments font
- Build the Tafel housing (rounded rect, dark bg, glow)
- Hardcode 2 departure rows with dummy data
- Get the visual right

### Phase 2: Live Data
- Curate station → RBL JSON mapping
- Implement API fetch (handle CORS)
- Parse response and render departures
- 30-second auto-refresh

### Phase 3: Station Selector
- Build slide-out sidebar
- Group stations by U-Bahn line
- Wire selection to data fetching

### Phase 4: Video Background + Polish
- Add looping background video with blur
- Add analog clock
- Optional: ambient audio toggle
- Optional: LED bar color segments
- Optional: scanline overlay effect
- Mobile responsiveness

---

## Summary

The simplest viable stack is **a single HTML file + CSS + vanilla JS**, with the WU3 Segments font and a video file. No frameworks, no package managers (unless you want Vite for TS). The Wiener Linien OGD API provides free, keyless real-time data. The main technical risk is CORS — solve it with a thin proxy. Everything else is front-end styling to nail the authentic Anzeigetafel look.
