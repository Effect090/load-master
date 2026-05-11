# Load Master

**Fast HVAC heating &amp; cooling load calculations for multi-zone buildings.**

Load Master is a free, open-source web app (and Android-ready PWA) that helps
engineers and technicians produce transparent preliminary HVAC load
calculations for apartments, offices, houses, classrooms and small commercial
spaces.

> Transparent simplified engineering load calculation based on public
> heat-transfer and psychrometric formulas. **Not** a certified regulatory
> calculation method unless validated by a qualified engineer.

---

## Features

- Multi-zone projects with unlimited zones and envelope elements per zone.
- Heating &amp; cooling load engine with **fully transparent formulas**.
- Per-element formula breakdown — every result shows its formula, inputs and
  intermediate values.
- Internal gains (lighting, equipment, occupants), ventilation, infiltration
  (ACH or direct airflow), heat-recovery efficiencies.
- Solar gain through windows by orientation with editable peak-irradiance
  presets.
- Project-level totals with diversity factor + safety margin.
- Recharts pie/bar charts for load breakdown.
- PDF report export (`jsPDF` + `jspdf-autotable`).
- JSON project import/export (no lock-in).
- Local-first storage with **IndexedDB** — no login required.
- Light, dark and system theme.
- English &amp; French UI.
- PWA-ready (installable, offline cached shell).
- Capacitor-ready for an Android APK build.
- Strict TypeScript, calculation-engine unit tests with **Vitest**.

## Tech stack

| Layer            | Library                                       |
| ---------------- | --------------------------------------------- |
| Framework        | [Next.js 14](https://nextjs.org) (App Router) |
| UI               | React 18 + Tailwind CSS + custom shadcn-style |
| Forms            | react-hook-form + Zod                         |
| State            | Zustand + React Context                       |
| Charts           | Recharts                                      |
| Icons            | lucide-react                                  |
| Storage          | IndexedDB via `idb`                           |
| PDF              | `jspdf` + `jspdf-autotable`                   |
| Tests            | Vitest                                        |
| Mobile wrapper   | Capacitor 6 (Android)                         |

## Folder layout

```
src/
  app/                  # Next.js routes
    page.tsx            # landing
    dashboard/          # project list
    projects/[id]/      # setup, zones, results, report
    settings/
  components/           # AppShell, Sidebar, ProjectForm, ZoneForm,
                        # EnvelopeElementTable, charts, etc.
    ui/                 # Button, Card, Input, Select, Field, Badge…
  features/
    projects/           # zustand store, factory, settings, useProject
    zones/              # zone templates
  lib/
    calculations/       # heating, cooling, psychrometrics, internal,
                        # zone, project (PURE FUNCTIONS — UI-free)
    defaults/           # U-values, internal gains, solar, climate presets
    pdf/                # PDF report generator
    storage/            # IndexedDB adapter
    validation/         # Zod schemas
    i18n/               # English + French messages
    utils.ts
  types/                # Project, Zone, EnvelopeElement, Results, Settings
  tests/                # Vitest unit tests for the calculation engine
public/
  manifest.webmanifest, icon.svg, sw.js
capacitor.config.ts
```

The calculation engine in `src/lib/calculations` has no React or DOM
dependency, so it can be reused by the PDF exporter, future server APIs, or
unit tests in isolation.

## Calculation method (transparent, public formulas)

| Load                            | Formula                                                  |
| ------------------------------- | -------------------------------------------------------- |
| Heating transmission            | `Q = (U·A + ψ·L) × ΔT_h`                                 |
| Heating ventilation (sensible)  | `Q = 0.335 × airflow_m3h × ΔT_h × (1 − ε_HR_sens)`       |
| Heating infiltration (sensible) | `Q = 0.335 × (volume × ACH or direct airflow) × ΔT_h`    |
| Cooling conduction              | `Q = (U·A + ψ·L) × ΔT_c`                                 |
| Cooling solar (windows)         | `Q = A_glass × SHGC × I × shading_factor`                |
| Cooling vent. sensible          | `Q = 0.335 × airflow_m3h × ΔT_c × (1 − ε_HR_sens)`       |
| Cooling vent. latent            | `Q = 0.83 × airflow_m3h × Δw_g/kg × (1 − ε_HR_lat)`      |
| People sensible / latent        | `Q = peopleCount × peopleSensible/Latent (preset)`       |
| Lighting                        | `Q = lightingTotalW or lightingWPerM² × floorArea`       |
| Equipment                       | user input                                               |
| Project diversity + safety      | `Q_reco = Σ Q_zone × diversity × (1 + safetyMargin)`     |

Coefficients **0.335** and **0.83** are derived from
ρ<sub>air</sub> ≈ 1.2 kg/m³, c<sub>p,air</sub> ≈ 1006 J/(kg·K) and
h<sub>fg</sub> ≈ 2 500 000 J/kg, with airflow expressed in m³/h.

Saturation vapor pressure uses the Magnus / August-Roche-Magnus form
`p_ws(T) = 610.94 × exp(17.625 T / (T + 243.04))` and humidity ratio is
`W = 0.62198 × p_w / (p − p_w)`.

## Quick start

Requirements: **Node.js 20+** and **npm**.

```bash
npm install
npm run dev          # http://localhost:3000
```

### Useful scripts

| Command            | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Run the app locally                             |
| `npm run build`    | Production build                                |
| `npm run start`    | Serve the production build                      |
| `npm run lint`     | ESLint                                          |
| `npm run typecheck`| TypeScript no-emit check                        |
| `npm test`         | Run the calculation-engine unit tests           |
| `npm run test:watch`| Watch tests during development                 |

### Deploy to Vercel (free)

```bash
vercel
```

The default `next` build runs out-of-the-box on the Vercel free tier.

## Android (Capacitor)

Two supported strategies, both completely free.

### Recommended: Hosted PWA wrapper

1. Deploy the web app to Vercel free tier (`vercel`).
2. Open `capacitor.config.ts` and uncomment the `server` block:

   ```ts
   server: {
     url: "https://your-loadmaster.vercel.app",
     cleartext: false,
   }
   ```

3. Add the Android platform once:

   ```bash
   npx cap add android
   ```

4. Build the APK:

   ```bash
   npx cap sync android
   npm run cap:open
   ```

   In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

This gives you the full Next.js app inside an Android shell with
instant updates — push to Vercel and the APK serves the latest UI.

### Alternative: Local-only static export

If you prefer a fully offline APK, refactor the dynamic project routes
into search params (so Next can produce a complete `out/` directory),
then:

```bash
npx next export -o out
npx cap sync android
npx cap open android
```

The current router uses `/projects/[id]/...` segments which require
known IDs at static-export time — this is a Next.js limitation, not a
Capacitor one.

## Storage &amp; data

- Projects are stored locally in **IndexedDB** under the key
  `load-master / projects`. No backend, no login required.
- You can export any project as JSON from the **Setup**, **Results** or
  **Report** pages, and re-import it on another device.
- A future Supabase adapter can be added without touching the calculation
  engine — only the `src/lib/storage/db.ts` interface needs to be swapped.

## Engineering assumptions

- All units are **SI**: m, m², m³, °C, W, m³/h, g/kg dry air, W/(m²·K).
- Solar irradiance values per orientation are simplified peak design values
  and **must be reviewed for the actual climate**.
- Ground and unconditioned-space boundaries default to the average of
  indoor and outdoor design temperatures unless overridden.
- Heat-recovery efficiencies apply to mechanical ventilation only.
- Safety margin applies to **both** per-zone and project-total recommended
  capacities: `Q_reco = Q × (1 + safety)`.
- Diversity factor applies **only** to the project-total recommended
  capacity: `Q_reco_project = Σ Q_zone × diversity × (1 + safety)`. Per-zone
  recommended capacities are sized without diversity so a zone can be sized
  to meet its peak load independently.
- Internal gains are clamped non-negative and multiplied by an optional
  diversity factor (0..1).
- Loads are clamped non-negative; for example, an adjacent room warmer
  than the indoor set-point produces 0 W of heating transmission.

## Known limitations

- Solar irradiance is a single peak value per orientation, not a 24-h
  hour-by-hour profile. Suitable for preliminary sizing.
- No transient/thermal-mass simulation — steady-state design conditions
  only.
- No infiltration model from wind/stack pressure; ACH and direct airflow
  are user-defined.
- No internal-shading or blinds model beyond a single shading factor.
- Internal gains use simple presets per occupancy, not full ASHRAE / RT
  / Manual J tables.

## Future improvements

- Hour-by-hour cooling load using sol-air temperature and CLTD/CLF style
  multipliers.
- Per-orientation solar profile by month and latitude (free public
  algorithms).
- Wind/stack-driven infiltration model.
- Optional Supabase or PocketBase backend for cloud sync.
- Imperial-units toggle (currently SI-first).
- More extensive calculation tests against published worked examples.

## Disclaimer

> This tool uses transparent engineering formulas and user-defined
> assumptions. It is **not** a certified regulatory calculation unless
> validated by a qualified engineer. The author claims no compliance
> with ASHRAE, Manual J, RT2012, RE2020 or any other proprietary or
> regulatory method.

## License

Open-source. Feel free to fork, modify and improve.
