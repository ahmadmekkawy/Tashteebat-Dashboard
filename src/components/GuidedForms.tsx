import React from "react";
import { Sun, LayoutGrid, Info, Upload, Sparkles, Check } from "lucide-react";
import { Inputs, ExtraLayer } from "../engine";
import {
  rooms,
  spacePresets,
  roomGuidance,
  fixtureTypes,
  fixturePresets,
  lightingGoals,
  sceneAdvice,
  kelvins,
  tempLabels,
  beamPresets,
  ipRatings,
} from "../data/catalog";
import {
  NumberField,
  SelectField,
  DimensionField,
  Advanced,
  SetInput,
} from "./Fields";
import { FixtureIllustration } from "./FixtureIllustration";
import { LayerEditor } from "./LayerEditor";
import {createLayer} from "../data/layerPresets";
import {makeId} from "../storage";
export type Plan = { name: string; url?: string };
interface Props {
  input: Inputs;
  set: SetInput;
  setAll: (i: Inputs) => void;
  step: number;
  smart: boolean;
  setSmart: (b: boolean) => void;
  applyRecommendation: () => void;
  selectFixture: (s: string) => void;
  recent: string[];
  plan?: Plan;
  setPlan: (p: Plan | undefined) => void;
  notify: (s: string) => void;
}
export function GuidedForms({
  input: i,
  set,
  setAll,
  step,
  smart,
  setSmart,
  applyRecommendation,
  selectFixture,
  recent,
  plan,
  setPlan,
  notify,
}: Props) {
  const room = rooms.find((r) => r[0] === i.room)!,
    g = roomGuidance[i.room];
  function roomChange(s: string) {
    const r = rooms.find((r) => r[0] === s)!,
      outdoor = roomGuidance[s].outdoor;
    setAll({
      ...i,
      room: s,
      lux: r[1],
      kelvin: r[3],
      outdoor,
      uf: outdoor ? 0.4 : 0.6,
      plane: outdoor ? 0 : 0.75,
      ip: outdoor ? "IP65" : "IP20",
      rating: outdoor ? "Outdoor" : "Indoor",
    });
  }
  const numeric = (
    label: string,
    key:
      | "lux"
      | "uf"
      | "mf"
      | "lumens"
      | "watts"
      | "beam"
      | "cri"
      | "dimension"
      | "quantity"
      | "wall"
      | "ceiling"
      | "floor"
      | "opticalEfficiency"
      | "hours"
      | "days"
      | "tariff"
      | "dimming",
    min: number,
    max: number,
    unit = "",
    step = 1,
    help?: string,
  ) => (
    <NumberField
      label={label}
      value={i[key]}
      min={min}
      max={max}
      step={step}
      unit={unit}
      help={help}
      onChange={(n) => set(key, n)}
    />
  );
  if (step === 0)
    return (
      <>
        <div className="two-col name-row">
          <label className="field">
            Room name
            <input
              value={i.name}
              maxLength={80}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Living room"
              required
            />
          </label>
          <SelectField
            label="Units"
            value={i.units === "metric" ? "Metric · meters" : "Imperial · feet"}
            options={["Metric · meters", "Imperial · feet"]}
            onChange={(s) =>
              set("units", s.startsWith("Metric") ? "metric" : "imperial")
            }
          />
        </div>
        <SelectField
          label="Room type"
          value={i.room}
          options={rooms.map((r) => r[0])}
          onChange={roomChange}
          help={room[2]}
        />
        <div className="field lower-row">
          Environment
          <div className="segmented">
            {[false, true].map((v) => (
              <button
                key={String(v)}
                className={i.outdoor === v ? "on" : ""}
                onClick={() =>
                  setAll({
                    ...i,
                    outdoor: v,
                    uf: v ? 0.4 : 0.6,
                    rating: v ? "Outdoor" : "Indoor",
                    ip: v ? "IP65" : "IP20",
                    plane: v ? 0 : 0.75,
                  })
                }
              >
                {v ? <Sun size={15} /> : <LayoutGrid size={15} />}{" "}
                {v ? "Outdoor" : "Indoor"}
              </button>
            ))}
          </div>
        </div>
        <Advanced title="Quick room presets">
          <div className="room-presets">
            {spacePresets.map((preset) => (
              <button
                key={preset.label}
                className="btn secondary"
                onClick={() => {
                  const room = rooms.find((r) => r[0] === preset.room)!;
                  const outdoor = roomGuidance[preset.room].outdoor;
                  setAll({
                    ...i,
                    name: preset.label,
                    room: preset.room,
                    length: preset.length,
                    width: preset.width,
                    height: preset.height,
                    mount: preset.height,
                    lux: room[1],
                    kelvin: room[3],
                    outdoor,
                    uf: outdoor ? 0.4 : 0.6,
                    plane: outdoor ? 0 : 0.75,
                    ip: outdoor ? "IP65" : "IP20",
                    rating: outdoor ? "Outdoor" : "Indoor",
                  });
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Advanced>
        <div className="field-divider" />
        <div className="subheading">
          Room dimensions<span>{i.units === "metric" ? "METERS" : "FEET"}</span>
        </div>
        <div className="three-col">
          <DimensionField
            label="Length"
            field="length"
            input={i}
            set={set}
            min={0.5}
          />
          <DimensionField
            label="Width"
            field="width"
            input={i}
            set={set}
            min={0.5}
          />
          <DimensionField
            label="Ceiling / space height"
            field="height"
            input={i}
            set={(k, v) => {
              if (k === "height" && i.mount === i.height)
                setAll({ ...i, height: v as number, mount: v as number });
              else set(k, v);
            }}
            min={1}
            max={20}
          />
        </div>
        <div className="area-strip">
          <LayoutGrid size={16} />
          <span>Calculated floor area</span>
          <strong>
            {Number.isFinite(i.length * i.width)
              ? (
                  i.length *
                  i.width *
                  (i.units === "imperial" ? 10.76391 : 1)
                ).toFixed(1)
              : "—"}{" "}
            {i.units === "imperial" ? "ft²" : "m²"}
          </strong>
        </div>
        <div className="info-inline">
          <Info size={14} />
          <span>
            All calculations use SI units internally. Enter clear internal
            dimensions; imperial inputs are converted to meters.
          </span>
        </div>
        <Advanced title="Room details & reference plan">
          <DimensionField
            label="Working-plane height"
            field="plane"
            input={i}
            set={set}
            max={10}
          />
          <div className="three-col lower-row">
            {numeric("Ceiling reflectance", "ceiling", 0, 100, "%", 5)}
            {numeric("Wall reflectance", "wall", 0, 100, "%", 5)}
            {numeric("Floor reflectance", "floor", 0, 100, "%", 5)}
          </div>
          <p className="small muted">
            Light ceiling ≈ 80%, mid-tone walls ≈ 50%, floor ≈ 20% are planning
            assumptions. Actual finish reflectance and room geometry must inform
            manufacturer UF selection.
          </p>
          <div className="upload-box">
            <Upload size={18} />
            <div>
              <strong>{plan?.name || "Have a room plan?"}</strong>
              <p>Reference only · confirm dimensions manually</p>
            </div>
            <label className="upload-button">
              {plan ? "Replace" : "Upload plan"}
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf,.dwg,.dxf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 20 * 1024 * 1024) {
                    notify("Choose a reference smaller than 20 MB.");
                    return;
                  }
                  if (plan?.url) URL.revokeObjectURL(plan.url);
                  setPlan({
                    name: f.name,
                    url: /image\/(png|jpeg)/.test(f.type)
                      ? URL.createObjectURL(f)
                      : undefined,
                  });
                }}
              />
            </label>
          </div>
          {plan && (
            <div className="plan-preview">
              {plan.url && (
                <img src={plan.url} alt="Uploaded room plan reference" />
              )}
              <p>
                PNG/JPEG previews; PDF/CAD reference selection only. No
                automatic scaling or geometry extraction. Files are not retained
                with saved projects.
              </p>
              <button
                className="text-button"
                onClick={() => {
                  if (plan.url) URL.revokeObjectURL(plan.url);
                  setPlan(undefined);
                }}
              >
                Remove attachment
              </button>
            </div>
          )}
        </Advanced>
      </>
    );
  if (step === 1)
    return (
      <>
        <div className="subheading">
          How should the space feel?<span>YOUR LIGHTING GOAL</span>
        </div>
        <div className="goal-grid">
          {lightingGoals.map((goal) => (
            <button
              key={goal.id}
              className={`goal-card ${i.goal === goal.id ? "chosen" : ""}`}
              onClick={() => set("goal", goal.id)}
            >
              <span>
                {goal.label}
                {i.goal === goal.id && <Check size={15} />}
              </span>
              <p>{goal.description}</p>
            </button>
          ))}
        </div>
        <div className="range-advice">
          <Sun size={20} />
          <div>
            <strong>
              {i.room} · {g.min}–{g.max} lux
            </strong>
            <p>
              Suggested design band · default {room[1]} lux. Workplace
              requirements must be checked for the actual task.
            </p>
          </div>
        </div>
        <div className="two-col lower-row">
          <SelectField
            label="Natural light"
            value={i.daylight}
            options={[
              "No natural light",
              "Low natural light",
              "Medium natural light",
              "High natural light",
            ]}
            onChange={(s) => set("daylight", s)}
          />
          <SelectField
            label="Time-of-day scene"
            value={i.scene}
            options={Object.keys(sceneAdvice)}
            onChange={(s) => set("scene", s)}
          />
        </div>
        <div className="info-inline">
          <Info size={14} />
          <span>
            {sceneAdvice[i.scene]} Daylight never reduces the design illuminance
            automatically.
          </span>
        </div>
        <button
          className={`recommend-choice ${smart ? "chosen" : ""}`}
          onClick={() => setSmart(!smart)}
        >
          <Sparkles size={22} />
          <span>
            <strong>Recommend for Me</strong>
            <small>
              {smart
                ? "On · we’ll build a starting plan from your room and goal."
                : "Let Luma suggest a complete layered starting plan."}
            </small>
          </span>
          <span className="selection-ring">{smart && <Check size={13} />}</span>
        </button>
        <p className="small muted">
          Functional and bright goals choose a target within the advisory range.
          Atmospheric goals keep the default task requirement and recommend warm
          dimmable scenes.
        </p>
      </>
    );
  if (step === 2)
    return (
      <>
        <div className="recommend-banner">
          <Sparkles size={19} />
          <div>
            <strong>
              {smart
                ? "A considered starting point"
                : "Your fixtures, your choice"}
            </strong>
            <p>
              Illustrative presets, not product specifications. Always use
              actual luminaire data.
            </p>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setSmart(true);
              applyRecommendation();
            }}
          >
            Recommend for Me
          </button>
        </div>
        <div className="two-col lower-row">
          <SelectField
            label="Primary lighting source"
            value={i.type}
            options={fixtureTypes}
            onChange={selectFixture}
            help={fixturePresets[i.type].use}
          />
          <label className="field">
            Output preset
            <span className="select-wrap">
              <select
                value=""
                onChange={(e) => {
                  const factor = Number(e.target.value),
                    p = fixturePresets[i.type];
                  setAll({
                    ...i,
                    lumens: p.lumens * factor,
                    watts: p.watts * factor,
                  });
                }}
              >
                <option value="" disabled>
                  Select an illustrative size
                </option>
                <option value="0.5">Small · low output</option>
                <option value="1">Medium · standard output</option>
                <option value="2">Large · high output</option>
              </select>
            </span>
          </label>
        </div>
        <div className="chosen-fixture">
          <FixtureIllustration type={i.type} />
          <div>
            <strong>{i.type}</strong>
            <p>
              {i.lumens} lm / module or fixture · {i.watts} W<br />
              For profiles and tracks, enter complete module output, not lumens
              per meter.
            </p>
          </div>
        </div>
        {recent.length > 0 && (
          <div className="recent-fixtures">
            <span>RECENTLY USED</span>
            {recent.map((t) => (
              <button key={t} onClick={() => selectFixture(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
        <Advanced title="Explore fixture illustrations">
          <div className="fixture-gallery">
            {fixtureTypes.map((type) => (
              <button
                key={type}
                className={i.type === type ? "chosen" : ""}
                onClick={() => selectFixture(type)}
              >
                <FixtureIllustration type={type} />
                <span>{type}</span>
              </button>
            ))}
          </div>
        </Advanced>
        <label className="check-label layer-toggle">
          <input
            type="checkbox"
            checked={i.mixed}
            onChange={(e) => setAll({...i,mixed:e.target.checked,layers:e.target.checked&&i.layers.length===0?[createLayer('Secondary',i.outdoor,makeId()),createLayer('Decorative',i.outdoor,makeId())]:i.layers})}
          />
          <span>
            <b>Include secondary and decorative lighting</b>
            <small>
              Combine spotlights, magnetic tracks, coves and wall lights in one
              room.
            </small>
          </span>
        </label>
        <LayerEditor input={i} set={set} />
      </>
    );
  return (
    <>
      <div className="range-advice">
        <Sun size={20} />
        <div>
          <strong>
            {g.min}–{g.max} lux suggested · default {room[1]} lux
          </strong>
          <p>
            Override the target below. This band is guidance, not a quoted
            standard range.
          </p>
        </div>
      </div>
      <div className="three-col lower-row">
        {numeric("Target illuminance", "lux", 1, 3000, "lux")}
        {numeric("Primary lumen output", "lumens", 1, 100000, "lm")}
        {numeric("Primary wattage", "watts", 0.1, 2000, "W", 0.1)}
      </div>
      <div className="subheading lower-row">
        Color temperature
        <span>
          SUGGESTED {g.cct[0]}–{g.cct[1]} K
        </span>
      </div>
      <div className="temperatures">
        {kelvins.map((k, j) => (
          <button
            key={k}
            title={tempLabels[j]}
            className={i.kelvin === k ? "chosen" : ""}
            onClick={() => set("kelvin", k)}
          >
            <span
              style={{
                background: [
                  "#f7a23e",
                  "#ffc070",
                  "#ffcd8e",
                  "#ffdbad",
                  "#ffe6ca",
                  "#fff1df",
                  "#f7f4ed",
                  "#f1f5fa",
                  "#e2edff",
                  "#d5e6ff",
                ][j],
              }}
            />
            {k}K
          </button>
        ))}
      </div>
      <p className="small muted">
        {tempLabels[kelvins.indexOf(i.kelvin)]} · Screen previews are
        illustrative. CCT suggestions are preferences, not absolute rules.
      </p>
      <div className="three-col lower-row">
        {numeric("Beam angle", "beam", 5, 160, "°")}
        {numeric("Color rendering index", "cri", 0, 100, "Ra")}
        {numeric("Primary quantity override", "quantity", 0, 1000, "units")}
      </div>
      <div className="beam-chips">
        {beamPresets.map((p) => (
          <button
            key={p.name}
            title={p.description}
            onClick={() => set("beam", p.angle)}
          >
            {p.name} · {p.angle}°
          </button>
        ))}
      </div>
      <p className="small muted">
        Quantity 0 = automatic sizing. CRI 90+ is recommended for finishes, skin
        tones and merchandise. Beam geometry applies only to approximately
        symmetric directional distributions.
      </p>
      <div className="two-col lower-row">
        <SelectField
          label="Fixture suitability"
          value={i.rating}
          options={["Indoor", "Outdoor", "Indoor / outdoor"]}
          onChange={(s) => set("rating", s)}
        />
        <SelectField
          label="IP rating"
          value={i.ip}
          options={ipRatings.map((r) => r.code)}
          onChange={(s) => set("ip", s)}
          help={ipRatings.find((r) => r.code === i.ip)?.meaning}
        />
      </div>
      <label className="check-label">
        <input
          type="checkbox"
          checked={i.dimmable}
          onChange={(e) => set("dimmable", e.target.checked)}
        />
        Dimmable fixtures with compatible controls
      </label>
      <Advanced title="Advanced settings · photometry & layout">
        <div className="two-col">
          {numeric("Utilization factor", "uf", 0.1, 1, "", 0.05)}
          {numeric("Maintenance factor", "mf", 0.1, 1, "", 0.05)}
          <DimensionField
            label="Mounting height"
            field="mount"
            input={i}
            set={set}
            min={0.1}
            max={20}
          />
          <DimensionField
            label="Working-plane height"
            field="plane"
            input={i}
            set={set}
            max={10}
          />
          {numeric("Fixture size", "dimension", 1, 5000, "mm")}
        </div>
        <p className="small muted">
          UF is the fraction of luminaire light reaching the calculation plane.
          Use manufacturer UF tables with room index and actual surface
          reflectances. MF allows for depreciation and dirt. Size is nominal
          diameter or linear length; verify clearance separately.
        </p>
        <label className="check-label">
          <input
            type="checkbox"
            checked={i.sourceOutput}
            onChange={(e) => set("sourceOutput", e.target.checked)}
          />
          My output value is bare-source lumens, not luminaire lumens
        </label>
        {i.sourceOutput &&
          numeric(
            "Optical efficiency",
            "opticalEfficiency",
            0.1,
            1,
            "",
            0.05,
            "Applied once to bare-source output only.",
          )}
        <div className="subheading lower-row">
          Geometric beam overlap<span>{Math.round(i.overlap * 100)}%</span>
        </div>
        <input
          className="range"
          type="range"
          aria-label="Beam overlap"
          min="0"
          max="0.5"
          step="0.05"
          value={i.overlap}
          onChange={(e) => set("overlap", +e.target.value)}
        />
        <p className="small muted">
          Overlap adjusts layout advice, not the lumen requirement. Verify
          uniformity and spacing-to-height criteria from IES/LDT data.
        </p>
        <div className="subheading lower-row">
          Custom brightness multiplier<span>{i.brightness.toFixed(2)}×</span>
        </div>
        <input
          className="range"
          aria-label="Custom brightness multiplier"
          type="range"
          min=".75"
          max="1.5"
          step=".25"
          value={i.brightness}
          onChange={(e) => set("brightness", +e.target.value)}
        />
        <p className="small muted">
          An explicit target override, independent of daylight or scene. Values
          below 1 may fail applicable workplace requirements.
        </p>
      </Advanced>
    </>
  );
}
