import React from "react";
import { Inputs, calculate } from "../engine";
const num = (n: number, d = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d });
export function LightingLayout({
  input,
  r,
}: {
  input: Inputs;
  r: ReturnType<typeof calculate> | undefined;
}) {
  const linear = /linear|track|cove/i.test(input.type);
  const horizontal = input.length < input.width;
  return (
    <section className="layout-card">
      <div className="mini-heading">
        <h3>Primary ambient layout</h3>
        <span>ILLUSTRATIVE</span>
      </div>
      <div className="room-plan">
        <span className="length-dim">{input.length} m</span>
        <span className="width-dim">{input.width} m</span>
        <div
          className="plan-room"
          style={{
            aspectRatio: `${Math.max(0.5, Math.min(2, input.length / input.width))}`,
          }}
        >
          {linear && (
            <>
              <div
                className={`diagram-run run-one ${horizontal ? "horizontal" : ""}`}
              />
              <div
                className={`diagram-run run-two ${horizontal ? "horizontal" : ""}`}
              />
            </>
          )}
          {r && r.installed <= 100 ? (
            Array.from({ length: r.installed }, (_, i) => (
              <div
                className="fixture-dot"
                key={i}
                style={{
                  left: linear
                    ? horizontal
                      ? `${10 + ((Math.floor(i / 2) + 0.5) / Math.ceil(r.installed / 2)) * 80}%`
                      : `${i % 2 === 0 ? 33 : 67}%`
                    : `${(((i % r.cols) + 0.5) / r.cols) * 100}%`,
                  top: linear
                    ? horizontal
                      ? `${i % 2 === 0 ? 33 : 67}%`
                      : `${10 + ((Math.floor(i / 2) + 0.5) / Math.ceil(r.installed / 2)) * 80}%`
                    : `${((Math.floor(i / r.cols) + 0.5) / r.rows) * 100}%`,
                }}
              >
                <span />
              </div>
            ))
          ) : (
            <span className="many-fixtures">
              {r?.installed ?? "—"} fixtures
            </span>
          )}
          <div className="room-label">
            {input.name || "Your space"}
            <small>{num(input.length * input.width, 1)} m²</small>
          </div>
        </div>
      </div>
      <div className="layout-caption">
        <span className="legend-dot" /> {input.type}
        <span>{r?.installed ?? "—"} fixtures</span>
      </div>
      <p className="layout-note">
        Concept layout of primary units only. Supplemental groups are not
        positioned. Confirm distribution, run orientation and spacing with
        manufacturer photometry.
      </p>
    </section>
  );
}
