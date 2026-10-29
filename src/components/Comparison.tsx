import React from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { Inputs, calculate } from "../engine";
export function Comparison({
  a,
  b,
  close,
}: {
  a: Inputs;
  b: Inputs;
  close: () => void;
}) {
  let ra, rb;
  try {
    ra = calculate(a);
    rb = calculate(b);
  } catch {
    return <p className="error">Correct current inputs to compare options.</p>;
  }
  const same =
    Math.abs(ra.area - rb.area) < 0.001 &&
    a.room === b.room &&
    Math.abs(ra.target - rb.target) < 0.1;
  return (
    <section className="comparison panel">
      <div className="mini-heading">
        <h3>
          <ArrowRightLeft size={16} /> Compare lighting options
        </h3>
        <button
          aria-label="Close comparison"
          className="icon-btn"
          onClick={close}
        >
          <X size={18} />
        </button>
      </div>
      <p className="small muted">
        Option A is pinned. Edit the current plan to explore Option B.
      </p>
      {!same && (
        <p className="warning">
          These options have different areas, room uses or targets. Compare
          service levels before comparing energy.
        </p>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Design measure</th>
              <th>Option A · {a.name}</th>
              <th>Option B · {b.name}</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Primary fixture", a.type, b.type],
              ["Area", `${ra.area.toFixed(1)} m²`, `${rb.area.toFixed(1)} m²`],
              [
                "Target / achieved lux",
                `${Math.round(ra.target)} / ${Math.round(ra.achieved)}`,
                `${Math.round(rb.target)} / ${Math.round(rb.achieved)}`,
              ],
              [
                "Primary / total units",
                `${ra.installed} / ${ra.totalUnits}`,
                `${rb.installed} / ${rb.totalUnits}`,
              ],
              [
                "Connected load",
                `${ra.power.toFixed(1)} W`,
                `${rb.power.toFixed(1)} W`,
              ],
              [
                "Power density",
                `${ra.powerDensity.toFixed(1)} W/m²`,
                `${rb.powerDensity.toFixed(1)} W/m²`,
              ],
              [
                "Annual energy",
                `${ra.kwh.toFixed(0)} kWh`,
                `${rb.kwh.toFixed(0)} kWh`,
              ],
              ["Selected CCT", `${a.kelvin} K`, `${b.kelvin} K`],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((c, j) =>
                  j === 0 ? (
                    <th scope="row" key={j}>
                      {c}
                    </th>
                  ) : (
                    <td key={j}>{c}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        Annual energy uses each option’s own operating hours and power fraction.
        This is not a product efficiency certification.
      </p>
    </section>
  );
}
