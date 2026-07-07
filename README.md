# WEQAA — Contracts & Bill-of-Quantities Dashboard
### لوحة متابعة العقود وجداول الكميات — مركز وقاء

An interactive, executive-level dashboard built from the center's **جداول الكميات**
(Bills of Quantities) and **المشاريع المكتملة** (Completed Projects) data. It keeps the
same visual identity as the source WEQAA presentation — emerald green `#027A4C`,
leaf-green `#93C045`, navy `#30415A`, orange `#CF5415`, and the WEQAA Center logo.

## Open it

Just open `index.html` in any modern browser. No build step, no server, no internet —
everything (data, logo, charts) is embedded and works offline from `file://`.

## Features

- **6 KPIs** — total contracted value, executed value, remaining value, financial
  execution rate (with progress ring), contract & item counts, contractor count.
- **Filters (cross-filtering):** status (active / completed / all), sector, main domain,
  owning department, contractor (searchable), and contract-start-year range. Every filter
  updates all KPIs, charts and insights live.
- **11 charts:** cumulative contracted-vs-executed burn-down, contracts started per year,
  value by sector (grouped), execution rate by department, spend by main domain (donut),
  top sub-domains, top-10 contractors, remaining budget by sector (stacked), contract
  execution progress bullets, value-vs-execution scatter (bubble = remaining), and a
  contract Gantt timeline coloured by execution health.
- **Auto insights** — highest/lowest execution sector, largest unspent budget, overdue
  contracts and value at risk, most-active contractor, and gap to 100% completion.
- **Detail table** — sortable, searchable, paginated, with per-row execution bars and
  **CSV export**.
- **Bilingual** Arabic (RTL) ⇄ English (LTR) toggle, and **light / dark** themes.
- **Accessible & responsive** — CVD-safe validated categorical palette, legends + direct
  labels (colour is never the only signal), reflows to tablet and mobile.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `assets/styles.css` | WEQAA-branded theming (light + dark) |
| `assets/app.js` | Data model, filters, i18n, hand-rolled SVG charts |
| `assets/data.js` | Dataset embedded as a JS global (from the source workbook) |
| `assets/logo.js` | WEQAA logo embedded as a data URI |
| `assets/data.json`, `assets/weqaa-logo.png` | Source-of-truth copies |

> Note: the dataset is Arabic government-contract / BOQ data (values in SAR). Row content
> (project, sector and company names) is intentionally **not** translated — only the UI
> chrome switches language.
