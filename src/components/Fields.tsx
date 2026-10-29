import React from "react";
import { ChevronDown, Info } from "lucide-react";
import { Inputs } from "../engine";
export type SetInput = <K extends keyof Inputs>(
  key: K,
  value: Inputs[K],
) => void;
export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  help?: string;
}) {
  return (
    <label className="field">
      {label}
      {help && (
        <span className="label-help" title={help}>
          <Info size={13} />
        </span>
      )}
      <span className="number-wrap">
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? NaN : Number(e.target.value))
          }
        />
        <span>{unit}</span>
      </span>
      {help && <small>{help}</small>}
    </label>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
  help,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  options: readonly string[];
  help?: string;
}) {
  return (
    <label className="field">
      {label}
      <span className="select-wrap">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={14} />
      </span>
      {help && <small>{help}</small>}
    </label>
  );
}
export function DimensionField({
  label,
  field,
  input,
  set,
  min = 0,
  max = 100,
}: {
  label: string;
  field: "length" | "width" | "height" | "mount" | "plane";
  input: Inputs;
  set: SetInput;
  min?: number;
  max?: number;
}) {
  const factor = input.units === "imperial" ? 3.280839895 : 1;
  return (
    <NumberField
      label={label}
      value={Math.round(input[field] * factor * 1000) / 1000}
      min={min * factor}
      max={max * factor}
      step={0.05 * factor}
      unit={input.units === "imperial" ? "ft" : "m"}
      onChange={(v) => set(field, v / factor)}
    />
  );
}
export function Advanced({
  children,
  title = "Advanced settings",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <details className="advanced">
      <summary>
        <span>{title}</span>
        <ChevronDown size={15} />
      </summary>
      <div className="advanced-body">{children}</div>
    </details>
  );
}
