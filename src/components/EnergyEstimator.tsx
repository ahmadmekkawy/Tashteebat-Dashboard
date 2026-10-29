import React from "react";
import { Zap } from "lucide-react";
import { Inputs, Calculation } from "../engine";
import { NumberField, SetInput, Advanced } from "./Fields";
export function EnergyEstimator({
  input: i,
  r,
  set,
}: {
  input: Inputs;
  r?: Calculation;
  set: SetInput;
}) {
  return (
    <section className="panel energy-panel">
      <div className="mini-heading">
        <h3>
          <Zap size={18} />A lighter footprint
        </h3>
        <span>ESTIMATED</span>
      </div>
      <div className="energy-stats">
        <div>
          <strong>
            {r?.kwh.toFixed(0) ?? "—"}
            <small>kWh / year</small>
          </strong>
          <span>Estimated electricity</span>
        </div>
        <div>
          <strong>
            {r?.powerDensity.toFixed(1) ?? "—"}
            <small>W / m²</small>
          </strong>
          <span>Connected load density</span>
        </div>
        <div>
          <strong>
            {r?.cost.toFixed(2) ?? "—"}
            <small>local currency / year</small>
          </strong>
          <span>At your entered tariff</span>
        </div>
      </div>
      <Advanced title="Energy assumptions">
        <div className="two-col">
          <NumberField
            label="Operating hours per day"
            value={i.hours}
            min={0}
            max={24}
            step={0.5}
            unit="h"
            onChange={(n) => set("hours", n)}
          />
          <NumberField
            label="Operating days per year"
            value={i.days}
            min={0}
            max={366}
            unit="days"
            onChange={(n) => set("days", n)}
          />
          <NumberField
            label="Electricity tariff"
            value={i.tariff}
            min={0}
            max={100}
            step={0.01}
            onChange={(n) => set("tariff", n)}
            help="Your local currency per kWh; no currency conversion."
          />
          <NumberField
            label="Average input-power fraction"
            value={i.dimming}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(n) => set("dimming", n)}
            help={
              i.dimmable
                ? "1 = full electrical input. Use measured or manufacturer control data."
                : "Ignored for non-dimmable fixtures; full power is used."
            }
          />
        </div>
        <p className="small muted">
          Annual kWh = total W / 1000 × hours/day × days/year × average
          input-power fraction. This does not alter the full-output design
          illuminance or assume that 50% light output means 50% electrical
          input.
        </p>
      </Advanced>
    </section>
  );
}
