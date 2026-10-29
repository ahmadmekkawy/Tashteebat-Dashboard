import React, { useEffect, useRef } from "react";
import { X, Sun, ExternalLink } from "lucide-react";
import { disclaimer, ipRatings } from "../data/catalog";
export function KnowledgeDialog({ close }: { close: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els =
          ref.current?.querySelectorAll<HTMLElement>("button,a[href]");
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [close]);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowledge-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-btn modal-close"
          onClick={close}
          aria-label="Close dialog"
        >
          <X />
        </button>
        <div className="section-icon">
          <Sun />
        </div>
        <span className="eyebrow">LIGHT, UNDERSTOOD</span>
        <h2 id="knowledge-title">A little science. Complete transparency.</h2>
        <p>
          The lumen method estimates maintained average illuminance across a
          horizontal working plane. It cannot calculate illuminance at
          individual points or certify compliance.
        </p>
        <div className="formula">
          Delivered lumens = E × A<br />
          Initial luminaire lumens = E × A / (UF × MF)
          <br />N = ceil(max(0, E × A − credited layer lumens) / (Φ × UF × MF))
        </div>
        <p>
          E is lux, A is m², Φ is luminaire output. If the input is bare-source
          lumens, optical efficiency is applied once to obtain luminaire output;
          it is never applied again to rated luminaire lumens. UF 0.60 indoors /
          0.40 outdoors and MF 0.80 are editable preliminary assumptions, not
          standard-prescribed values.
        </p>
        <p>
          Room index K = L × W / [Hm × (L + W)], where Hm is mounting height
          above the working plane. Height, geometry and reflectances influence
          real utilization, so use manufacturer UF tables or IES/LDT simulation.
          We show room index and reflectances rather than inventing a correction
          curve. MF requires a maintenance schedule and depreciation data.
        </p>
        <p>
          Mixed lighting: secondary, task, accent and decorative groups add to
          load and energy. They do not contribute to whole-room lux unless
          explicitly enabled and assigned appropriate UF/MF for the same
          horizontal plane. Supplemental lumens are entered as complete
          luminaire output. The grid shows primary ambient units only.
        </p>
        <h3>Layout and energy</h3>
        <p>
          Symmetric beam diameter = 2 × Hm × tan(beam angle / 2). Center spacing
          starts at diameter × (1 − selected overlap). This is a geometric
          heuristic, not a uniformity or glare result. Nominal spacing = √(area
          / primary quantity); actual grid spacing follows room geometry and
          wall setbacks are half a grid cell. Linear runs are concept
          suggestions, not output-per-meter sizing.
        </p>
        <p>
          Annual energy = total W / 1000 × hours/day × days/year × average
          input-power fraction. Cost = kWh × your tariff in your chosen local
          currency. The power fraction is an estimate of electrical input, not
          an assumption that dimming percentage equals electrical power.
          Non-dimmable fixtures use full power. W/m² is connected load density,
          not a code-compliance assessment.
        </p>
        <h3>Recommendations, sources and limits</h3>
        <p>
          All displayed lux ranges are suggested design bands, not quoted
          normative standard ranges. Default 500 lux for office reading/writing
          and meeting tasks, 300 lux for reception and general retail are
          informed by EN 12464-1:2021 task categories. Actual requirements
          depend on task, context, uniformity, glare, age and local adoption.
          Home-office guidance does not establish workplace compliance.
          Residential and outdoor values are advisory starting points.
        </p>
        <ul>
          <li>
            <a
              href="https://knowledge.bsigroup.com/search?query=EN%2012464-1"
              target="_blank"
              rel="noreferrer"
            >
              EN 12464-1:2021 — Indoor work places <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a
              href="https://www.ies.org/standards/"
              target="_blank"
              rel="noreferrer"
            >
              IES Lighting Library / Lighting Handbook{" "}
              <ExternalLink size={12} />
            </a>{" "}
            — task-based design, utilization and layering.
          </li>
          <li>
            <a
              href="https://cie.co.at/publications"
              target="_blank"
              rel="noreferrer"
            >
              CIE 97:2005 — Maintenance of Indoor Electric Lighting Systems{" "}
              <ExternalLink size={12} />
            </a>
          </li>
          <li>
            IEC 60529 — IP enclosure protection. Ratings describe tests; they do
            not establish complete installation suitability.
          </li>
        </ul>
        <p>
          Daylight and time-of-day scenes change control advice only. They never
          subtract unmeasured daylight or automatically lower required lux. Goal
          presets choose within an advisory band; custom brightness multipliers
          are user overrides and can fall below required workplace targets. CCT
          and CRI advice is a design recommendation, not a lux multiplier.
        </p>
        <h3>Four useful layers</h3>
        <p>
          <b>Ambient:</b> the general base. <b>Task:</b> light on the activity.{" "}
          <b>Accent:</b> light on a feature. <b>Decorative:</b> visual
          character. Use separate circuits so one layer need not do every job.
        </p>
        <h3>Understanding IP ratings</h3>
        <div className="ip-list">
          {ipRatings.map((r) => (
            <p key={r.code}>
              <b>{r.code}</b> — {r.meaning} {r.use}
            </p>
          ))}
        </div>
        <p>
          No emergency-lighting assessment, UGR calculation, uniformity result,
          vertical facade simulation or regulatory certification is produced.
          Outdoor, indirect and accent layouts need appropriate photometry. CCT
          previews are illustrative; screen colors are not calibrated light
          spectra.
        </p>
        <div className="warning">{disclaimer}</div>
      </section>
    </div>
  );
}
