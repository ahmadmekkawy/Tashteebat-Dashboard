import React from "react";
import { Sun, Info, CheckCircle2, Layers, ShieldCheck } from "lucide-react";
import { Inputs, Calculation } from "../engine";
import { guidance } from "../recommendation";
import { roomGuidance, ipRatings, disclaimer } from "../data/catalog";
import { LightingLayout } from "./LightingLayout";
const n = (v: number, d = 0) =>
  v.toLocaleString("en-US", { maximumFractionDigits: d });
export function Summary({
  input,
  r,
  error,
  onMethod,
}: {
  input: Inputs;
  r?: Calculation;
  error: string;
  onMethod: () => void;
}) {
  return (
    <section className="results-card">
      <div className="result-heading">
        <span>
          <span className="pulse" />
          LIVE DESIGN ESTIMATE
        </span>
        <button
          className="icon-btn"
          aria-label="Calculation assumptions"
          onClick={onMethod}
        >
          <Info size={16} />
        </button>
      </div>
      {r ? (
        <>
          <div className="lux-main">
            <div className="lux-icon">
              <Sun size={27} />
            </div>
            <div>
              <span className="result-label">Selected design illuminance</span>
              <div className="big-number">
                {n(r.target)}
                <span>lux</span>
              </div>
              <span className="result-caption">
                Suggested band {roomGuidance[input.room].min}–
                {roomGuidance[input.room].max} lux · not a regulatory range
              </span>
            </div>
          </div>
          <div className="result-divider" />
          <div className="result-pair">
            <div>
              <span className="result-label">
                Initial luminaire light needed
              </span>
              <strong>
                {n(r.lumens)}
                <small>lm</small>
              </strong>
              <span className="result-caption">
                Before any credited supplemental groups
              </span>
            </div>
            <div>
              <span className="result-label">Primary fixtures needed</span>
              <strong>
                {n(r.count)}
                <small>units</small>
              </strong>
              <span className="result-caption">
                {r.installed} planned · {r.totalUnits} across all layers
              </span>
            </div>
          </div>
          <div className="estimate-note">
            <CheckCircle2 size={15} />
            <span>
              UF {input.uf} · MF {input.mf} · no assumed daylight credit
            </span>
          </div>
          <div className="result-facts">
            <span>
              Floor area
              <strong>
                {n(r.area, 1)} m²
                {input.units === "imperial"
                  ? ` / ${n(r.area * 10.7639, 1)} ft²`
                  : ""}
              </strong>
            </span>
            <span>
              Estimated achieved<strong>{n(r.achieved)} lux</strong>
            </span>
            <span>
              Connected load
              <strong>
                {n(r.power, 1)} W · {n(r.powerDensity, 1)} W/m²
              </strong>
            </span>
            <span>
              Primary fixture efficacy<strong>{n(r.efficacy)} lm/W</strong>
            </span>
            <span>
              Nominal primary spacing<strong>~{n(r.spacing, 1)} m</strong>
            </span>
          </div>
        </>
      ) : (
        <div className="error" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}
export function DetailedResults({
  input,
  r,
  onMethod,
}: {
  input: Inputs;
  r: Calculation;
  onMethod: () => void;
}) {
  const g = guidance(input),
    linear = /linear|track|cove/i.test(input.type),
    cone = /spotlight|downlight|track|flood/i.test(input.type);
  return (
    <div className="detailed-results">
      <section className="panel strategy-panel">
        <div className="section-icon">
          <Layers size={21} />
        </div>
        <span className="eyebrow">A PLAN, NOT JUST A NUMBER</span>
        <h2>Your {input.room.toLowerCase()}, thoughtfully lit.</h2>
        <p>{g.strategy}</p>
        <div className="result-tags">
          <span>{g.cct} suggested</span>
          <span>CRI 90+ suggested</span>
          {cone && <span>Ambient beam 60–90° suggested</span>}
          <span>
            {input.dimmable ? "Dimmable layers" : "Consider dimmable layers"}
          </span>
        </div>
        <div className="layer-summary">
          {["Primary", "Secondary", "Task", "Accent", "Decorative"].map(
            (role, j) => (
              <article key={role}>
                <span>
                  0{j + 1} / {role}
                </span>
                <strong>
                  {role === "Primary"
                    ? `${r.installed} ${input.type.toLowerCase()}`
                    : input.mixed
                      ? input.layers
                          .filter((l) => l.role === role && l.quantity > 0)
                          .map((l) => `${l.quantity} ${l.type.toLowerCase()}`)
                          .join(", ") || "Optional / not specified"
                      : "Optional dedicated layer"}
                </strong>
                <p>
                  {
                    [
                      "The main source, sized after secondary light contributions.",
                      "A second system, such as magnetic track or linear profiles.",
                      "Put light directly on the activity.",
                      "Bring a feature into focus; 24–36° beams are an accent starting point.",
                      "Give the room a focal point.",
                    ][j]
                  }
                </p>
              </article>
            ),
          )}
        </div>
        <p className="small muted">
          Supplemental groups are concept allowances, not a task-area
          illuminance simulation. Select real products and verify local task
          lighting.
        </p>
      </section>
      <section className="panel source-breakdown">
        <h3>Lighting sources at a glance</h3>
        <p>
          See what each source adds to the room. Only credited sources
          contribute to the estimated average lux.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Layer / source</th>
                <th scope="col">Quantity</th>
                <th scope="col">Power</th>
                <th scope="col">Average lux contribution</th>
              </tr>
            </thead>
            <tbody>
              {r.groups
                .filter(
                  (group) => group.quantity > 0 || group.role === "Primary",
                )
                .map((group) => (
                  <tr key={group.id}>
                    <th scope="row">
                      <span
                        className={`source-badge ${group.role.toLowerCase()}-badge`}
                      >
                        {group.role}
                      </span>
                      <strong>{group.type}</strong>
                    </th>
                    <td>{group.quantity}</td>
                    <td>{n(group.power, 1)} W</td>
                    <td>
                      {group.contributes
                        ? `≈ ${n(group.maintainedLm / r.area)} lux`
                        : "Not credited · atmosphere / local light"}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total across all sources</th>
                <td>{r.totalUnits}</td>
                <td>{n(r.power, 1)} W</td>
                <td>≈ {n(r.achieved)} lux</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      <div className="two-col results-two">
        <LightingLayout input={input} r={r} />
        <section className="panel layout-explanation">
          <h3>From light output to layout</h3>
          <p>
            {linear
              ? g.run
              : cone
                ? g.spacing
                : "Use manufacturer distribution data for diffuse, wall-mounted and decorative luminaires. A circular beam footprint is not applicable to all fixture types."}
          </p>
          <dl>
            <div>
              <dt>Mount above working plane</dt>
              <dd>{n(input.mount - input.plane, 2)} m</dd>
            </div>
            <div>
              <dt>Concept grid cells</dt>
              <dd>
                {n(r.spacingX, 1)} × {n(r.spacingY, 1)} m
              </dd>
            </div>
            <div>
              <dt>Nominal wall offsets</dt>
              <dd>
                {n(r.wallX, 1)} / {n(r.wallY, 1)} m
              </dd>
            </div>
            {cone && (
              <div>
                <dt>Beam-cone spacing suggestion</dt>
                <dd>≤ {n(r.diameter * (1 - input.overlap), 1)} m</dd>
              </div>
            )}
          </dl>
          {cone &&
            Math.max(r.spacingX, r.spacingY) >
              r.diameter * (1 - input.overlap) && (
              <p className="warning">
                The lumen-count grid exceeds your beam-overlap spacing
                suggestion. Use broader beams, adjust layout or add fixtures,
                then verify distribution.
              </p>
            )}
          <p className="small muted">
            Setback is half a grid cell, not a universal wall distance rule.
            Fixtures do not necessarily fill all grid cells. The drawing is
            illustrative, not to scale when the aspect ratio is extreme.
          </p>
        </section>
      </div>
      <div className="two-col results-two">
        <section className="panel">
          <h3>
            <Sun size={17} />
            Daylight, scenes & visual comfort
          </h3>
          <p>
            <b>{input.scene}:</b> {g.scene}
          </p>
          <p>
            <b>{input.daylight}:</b> {g.daylight}
          </p>
          <p>{g.glare}</p>
        </section>
        <section className="panel">
          <h3>
            <ShieldCheck size={17} />
            {input.outdoor
              ? "Outdoor protection"
              : "Fixture quality & protection"}
          </h3>
          <p>
            <b>{input.ip}:</b>{" "}
            {ipRatings.find((x) => x.code === input.ip)?.meaning}
          </p>
          <p>
            {input.outdoor
              ? "IP44/54 may suit sheltered splash exposure; IP65 is a common exposed-fixture starting point; IP67 for temporary immersion test conditions does not remove the need for drainage. Verify environmental certification and local wiring rules."
              : "IP20 is only for dry interiors. Bathroom wet zones and other splash locations need specific protection and local electrical-zone verification."}
          </p>
          <p>
            Choose CRI 90+ where skin tones, food, finishes or merchandise
            matter. CCT is a preference; your selected {input.kelvin} K does not
            change lumen demand.
          </p>
        </section>
      </div>
      <details className="advanced technical-detail" open>
        <summary>
          Calculation detail & assumptions
          <Info size={15} />
        </summary>
        <div className="advanced-body">
          <div className="formula">
            {n(r.target)} lux × {n(r.area, 1)} m² = {n(r.delivered)} delivered
            lm
            <br />
            {n(r.delivered)} ÷ ({input.uf} × {input.mf}) = {n(r.lumens)} initial
            luminaire lm
            <br />
            ceil[max(0, {n(r.delivered)} − {n(r.layerDelivered)}) ÷{" "}
            {n(r.effective, 1)}] = {r.count} primary units
          </div>
          <div className="assumptions-grid">
            <div>
              <span>Luminaire output / primary</span>
              <strong>{n(r.luminaireLumens)} lm</strong>
            </div>
            <div>
              <span>Effective maintained / primary</span>
              <strong>{n(r.effective)} lm</strong>
            </div>
            <div>
              <span>Room index K</span>
              <strong>{n(r.roomIndex, 2)}</strong>
            </div>
            <div>
              <span>Ceiling / wall / floor reflectance</span>
              <strong>
                {input.ceiling} / {input.wall} / {input.floor}%
              </strong>
            </div>
          </div>
          <p>
            {input.sourceOutput
              ? `Bare-source input is multiplied by optical efficiency ${input.opticalEfficiency} once.`
              : "Lumens are rated luminaire output. No additional optical efficiency loss is applied."}{" "}
            UF and MF remain explicit user assumptions. Reflectances and room
            index guide selection from manufacturer data; no fabricated UF
            correction is applied.
          </p>
          <button className="text-button" onClick={onMethod}>
            Read formulas, limitations & references <Info size={13} />
          </button>
        </div>
      </details>
      <p className="professional-disclaimer">{disclaimer}</p>
    </div>
  );
}
