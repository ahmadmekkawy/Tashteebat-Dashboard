# Luma · Lighting Studio

A responsive, local-first lighting calculator and design assistant for residential and light-commercial projects. React + TypeScript + Vite, with no backend, account or API credentials required.

## Version 2.1 updates

- Explicit primary, secondary and decorative lighting sources. Secondary magnetic tracks and decorative coves or wall lights can coexist with primary spotlights. Each additional source has independent fixture selection, quantity, lumens, power, utilization and maintenance factors.
- Secondary sources intended for general light receive explicit same-plane credit; atmospheric coves and wall accents are not automatically counted toward whole-room lux. Results show a per-source quantity, power and credited-lux breakdown.
- Primary fixtures automatically cover the remaining target after secondary contributions. Additional task/accent sources remain available. Existing supplemental ambient groups migrate to the secondary label.
- Larger 14 px labels, 16 px input text, 14–15 px explanatory copy, 19–21 px section headings, stronger text contrast and source-colored cards. Forms reorganize into fewer columns on small screens, with touch-friendly controls.
- The build generates `Luma-App.zip` containing the runnable standalone HTML. Extract and double-click the HTML; no installation is required.

## Setup

Requirements: Node.js 20.19+ or 22.12+ (validated with Node 24), npm and Python 3. Python is used only to package downloadable files during a build; the app has no Python backend.

```sh
npm ci
npm run dev -- --port 5173
```

In the cloud workspace use `npm ci --cache /workspace/.npm-cache` if the default npm cache is not writable.

```sh
npm test        # numerical, boundary, recommendation, migration and report tests
npm run build  # TypeScript, production bundle, standalone HTML, source ZIP
```

Serve `dist/` from an HTTPS static host at the domain root. For local production verification:

```sh
python3 -m http.server 4173 --directory dist
```

Use **Download HTML** or **Source ZIP** at the top of the app. The build generates both files under `public/downloads/` and `dist/downloads/`; workspace-file links are not needed. Source ZIPs exclude dependencies and generated downloads. The single HTML bundles the JavaScript, styles and SVG illustrations. Optional external Google Fonts fall back to system fonts without a connection.

The production service worker precaches the current hashed application assets, manifest and icons. Once the initial online installation completes, a new offline navigation can load the calculator. The service worker is disabled in development and in the standalone HTML. Browser/PWA installation support varies by platform. To install on supported Android browsers, visit the hosted HTTPS app and use the browser's Install/Add to Home Screen action. Downloading the HTML is an alternative, not an Android APK.

## Guided workflow

1. **Space:** room name/type, indoor/outdoor, metric or imperial dimensions, room presets and advanced reflectances/working plane.
2. **Lighting goal:** balanced, functional, atmospheric or bright; natural light and time-of-day control advice.
3. **Fixture preference:** choose a primary luminaire, explore illustrations, or apply **Recommend for Me**. Combine primary, secondary and decorative sources, with optional task and accent groups.
4. **Technical details:** override lux, output, watts, CCT, beam, CRI, quantity and protection. Advanced settings expose UF, MF, optical efficiency, mounting geometry and beam overlap.
5. **Results:** live sizing, recommended strategy, illustrative layout, technical assumptions, energy/cost estimates and professional caveats.

Recommend for Me needs only a room, dimensions/height, environment and atmosphere. It supplies editable design defaults, primary fixture sizing and secondary lighting and supplemental layer allowances. Task/accent/decorative groups are not asserted to meet local task lux without further verification. Secondary general-lighting groups use explicit, editable UF/MF credit for the shared calculation plane.

Features include 23 room types; 22 fixture categories; ten Kelvin options; output presets; advisory lux bands and default targets; CRI, dimming, glare and IP guidance; a primary ambient diagram; geometric beam overlap and wall setbacks; concept linear runs; W/m²; annual kWh/cost; local save, reopen, duplicate, favorite and delete; recent fixtures; pin-and-edit comparison; text export; copy summary; and browser print/save-to-PDF.

Previous locally saved projects are merged with current defaults without rewriting storage on load. Legacy projects that fail stricter outdoor checks remain available to open and correct. Saving creates a new snapshot; it does not silently replace another project. Clearing site data deletes local projects. Export reports for a portable copy. No project details or reference files are sent to a backend.

JPEG/PNG previews and PDF/CAD reference selection remain available as an optional extra. **No plan parsing, automatic scaling or CAD geometry extraction is performed.** Confirm dimensions manually. Attachments stay in memory and are not persisted with projects.

## Engineering model and assumptions

All calculations use SI units internally. Imperial entry is converted to meters.

```text
A = length × width
E = selected base lux × explicit user brightness multiplier
Delivered maintained lumens = E × A
Initial luminaire lumens needed (no supplemental credit) = E × A / (UF × MF)

Primary luminaire output Φ = entered output
  or entered bare-source output × optical efficiency, if explicitly selected
Effective maintained primary lumens = Φ × UF × MF
Credited supplemental lumens = Σ(quantity × luminaire lm × group UF × group MF)
  only for groups explicitly serving the same horizontal calculation plane

Primary quantity = max(0, ceil((E × A − credited supplemental lumens) / effective primary lm))
Estimated achieved average lux = (installed primary quantity × effective primary lm + credited supplemental lm) / A
Connected W = primary quantity × W/unit + Σ(supplemental quantity × W/unit)
Lighting power density = connected W / A
Primary efficacy = luminaire output / primary W
```

The quantity override uses zero for automatic sizing. Adding task, accent or decorative groups increases load and energy, but does **not** increase whole-room lux unless their contribution is explicitly enabled and appropriate UF/MF values are entered. Supplemental outputs are complete luminaire lumens. This avoids treating a focused reading lamp or chandelier as verified uniform ambient light.

Default indoor UF 0.60, outdoor UF 0.40 and MF 0.80 are **editable planning assumptions**, not standard-prescribed values. Obtain UF from manufacturer data for the actual distribution, reflectances and room geometry. Determine MF from depreciation, dirt and a cleaning/replacement schedule. Optical efficiency is never double-counted on already-rated luminaire output.

```text
Hm = mounting height − working-plane height
Room index K = L × W / [Hm × (L + W)]
Symmetric beam footprint diameter = 2 × Hm × tan(beam angle / 2)
Geometric center-spacing suggestion = beam diameter × (1 − overlap setting)
Nominal primary spacing = sqrt(A / installed primary quantity)
Actual concept grid cell = L / columns by W / rows
Nominal wall offsets = half each grid cell
```

Room index, height and reflectances inform real UF selection; the app deliberately does not invent an automatic loss curve without manufacturer photometry. Geometric overlap does not guarantee uniformity; verify spacing-to-height ratios and IES/LDT data. The cone model is not suitable for all diffuse, linear, wall-washing or indirect luminaires. Linear/track suggestions use two concept runs of 80% of the shorter room dimension, placed near thirds of the longer dimension. These lengths are design heuristics, not standards or watt-per-meter sizing; module output, furniture, drivers and actual distribution must be verified. Diagrams show primary units only, compress extreme aspect ratios, and are not construction drawings.

```text
Annual energy (kWh) = total W / 1000 × hours/day × days/year × average input-power fraction
Annual cost = kWh × entered local-currency tariff
```

The input-power fraction is an operating assumption, not an assumption that light-output dimming percentage equals electrical input power. It applies globally to the included groups; non-dimmable plans use full input power. Energy estimates never reduce the design illuminance. No currency conversion or code power-limit assessment is performed.

Daylight and daytime/evening/night scenes affect control recommendations only. They do not subtract unmeasured daylight or arbitrarily reduce task illuminance. Atmospheric goals recommend warm dimmable scenes while retaining the default design target. Bright/functional goals select targets within the advisory design band. An explicit brightness override can lower targets below applicable workplace requirements; the app warns about that distinction. CCT is a preference, not a lumen multiplier.

## Recommendation basis and references

Every displayed lux **range is an advisory design band**, not a quoted normative standard range. Defaults for commercial office reading/writing and meeting tasks (500 lux), reception (300 lux), and general retail sales (300 lux) are informed by EN 12464-1:2021 task categories. Confirm task-specific tables, modified illuminance criteria, uniformity, glare, edition, national adoption and local rules. Home-office settings alone do not establish workplace compliance.

Residential ambient targets (generally 100–300 lux), outdoor targets, CCT bands, fixture recipes, CRI advice and layout heuristics are preliminary design recommendations. Outdoor UF assumes the selected equipment can deliver a useful portion of its lumens to the selected area; that assumption needs particularly careful verification. Facade targets refer to a vertical-surface problem that the horizontal lumen model cannot solve. The app labels that limitation.

- [BS EN 12464-1:2021 — Indoor work places](https://knowledge.bsigroup.com/search?query=EN%2012464-1).
- [IES Lighting Library / Lighting Handbook](https://www.ies.org/standards/): task-based design, layering, utilization and maintained-light principles.
- [CIE publications, including CIE 97:2005](https://cie.co.at/publications): maintenance of indoor electric lighting systems.
- IEC 60529: IP enclosure protection. IP44/54 address splash exposure; IP65 water jets; IP67 temporary immersion under test conditions; IP68 conditions specified by the manufacturer. Ratings alone do not establish complete installation suitability, electrical-zone compliance, corrosion resistance or drainage requirements.

> The calculator provides preliminary design guidance and approximate lighting recommendations. Final lighting design for construction should be verified by a qualified lighting designer, electrical engineer, or architect, especially for commercial, workplace, emergency, or regulated environments.

No UGR, uniformity, point-by-point photometry, vertical facade simulation, emergency-lighting assessment, exact indirect distribution, or regulatory certification is produced. Dimming compatibility, electrical design, environmental suitability and manufacturer data still require verification.

## Sample checks

| Case                                                                  | Expected result                                                                                |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 5 × 4 m, 150 lux, 800 lm/unit, UF .60, MF .80                         | 3,000 delivered lm; 6,250 initial luminaire lm; 8 primary fixtures; 153.6 maintained lux; 72 W |
| Current living-room preset, same geometry, 200 lux                    | ≈8,333 initial lm; 11 primary fixtures; ≈211 lux; 99 W                                         |
| Two 500 lm, 6 W task lamps, no ambient credit, first case             | Still 8 primary fixtures and 153.6 lux; total 84 W                                             |
| Two same-plane 1,000 lm supplemental units credited at UF .50, MF .80 | 800 maintained supplemental lm; 6 primary units; 155.2 lux                                     |
| First case, bare-source lumens at .50 optical efficiency              | 400 luminaire lm per unit; 16 primary units                                                    |
| 72 W, 5 h/day, 365 days/year, .50 average input-power fraction        | 65.7 kWh/year; 13.14 at .20 local currency/kWh                                                 |

The automated suite covers these cases, validation, daylight/scene invariance, zero-primary mixed plans, all room recipes, migration and report content.

Browser smoke tests (optional Python test tooling) use isolated browser storage:

```sh
python3 -m pip install playwright
# Install Chromium with Playwright or point CHROMIUM_PATH at an existing browser.
python3 -m playwright install chromium
# Serve dist/ first, then:
python3 tests/browser_smoke.py http://127.0.0.1:4173
python3 tests/accessibility.py http://127.0.0.1:4173
python3 tests/layers_smoke.py http://127.0.0.1:4173
```

The smoke suite covers the smart flow, metric/imperial conversion, mixed groups, advanced inputs, error recovery, comparison, clipboard, printing, export, legacy storage, favorites/duplication/deletion, downloadable packages, keyboard dialogs, 390 px layouts and offline use. The accessibility audit uses `axe-core` from npm and tests the five main steps. Automated checks do not replace manual usability or assistive-technology review.

## Architecture

- `src/data/catalog.ts`: room presets, lux/CCT guidance, fixture specifications, beam presets, IP explanations, goals and scene guidance.
- `src/data/advice.ts`: room-specific fixture/layer strategy text.
- `src/data/layerPresets.ts`: primary/secondary/decorative role explanations and editable supplemental-source presets.
- `src/engine.ts`: strongly typed inputs, migration defaults, validation and pure numeric calculations.
- `src/recommendation.ts`: room/goal-driven recipes and layout/control advice, separate from numerical sizing.
- `src/storage.ts`: local project models and legacy loading; `src/report.ts`: portable report generation.
- `src/components/`: reusable guided forms, typed fields, layer editor, schematic illustrations, layout, results, comparison, energy and knowledge dialog.
- `src/main.tsx`: navigation and workflow composition.
- `src/*.test.ts`, `tests/`: calculation/recommendation tests and browser verification.
- `public/`, `scripts/package_downloads.py`: PWA assets, offline caching, and reproducible download packaging.

## Future improvements

- Manufacturer-backed IES/LDT import, actual UF tables and point-by-point uniformity/glare calculations.
- Dedicated vertical facade, outdoor obtrusive-light and emergency-lighting workflows with appropriate standards.
- Separate task-area geometry and per-group mounting, CCT, protection and electrical-control schedules.
- CAD/BIM geometry import, calibrated plan scaling and furniture-aware layouts.
- Product-specific driver/optical data, manufacturer catalogs and measured power-versus-dimming curves.
- Optional synchronization and rich PDF layouts; core local calculation should remain usable without an account.
