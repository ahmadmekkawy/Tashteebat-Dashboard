import React from "react";
import { makeId } from "../storage";
import { Plus, Trash2, Layers, Lightbulb, ChevronDown } from "lucide-react";
import { Inputs, ExtraLayer, LayerRole, calculate } from "../engine";
import { fixtureTypes, fixturePresets } from "../data/catalog";
import { createLayer, layerDescriptions } from "../data/layerPresets";
import { NumberField, SelectField, SetInput, Advanced } from "./Fields";
import { FixtureIllustration } from "./FixtureIllustration";
export function LayerEditor({ input, set }: { input: Inputs; set: SetInput }) {
  function change(id: string, patch: Partial<ExtraLayer>) {
    set(
      "layers",
      input.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }
  function add(role: LayerRole) {
    if (input.layers.length >= 12) return;
    set("mixed", true);
    set("layers", [
      ...input.layers,
      createLayer(role, input.outdoor, makeId()),
    ]);
  }
  let primaryQuantity: string = "—";
  try {
    primaryQuantity = String(calculate(input).installed);
  } catch {
    /* Validation appears in the live summary. */
  }
  return (
    <section className="layer-editor">
      <div className="subheading">
        Build your lighting layers <Layers size={20} />
      </div>
      <p className="small muted">
        One room can use several lighting systems. Set each source
        independently; the calculator combines their power and any light
        credited to the working plane.
      </p>
      <article className="primary-layer-card">
        <div className="source-card-heading">
          <span className="source-badge primary-badge">01 · PRIMARY</span>
          <span className="source-total">
            {primaryQuantity} planned fixtures
          </span>
        </div>
        <h3>{input.type}</h3>
        <p>
          The main lighting system. Automatic sizing supplies the remaining
          light after credited secondary sources.
        </p>
        <div className="three-col">
          <NumberField
            label="Primary lumens per unit"
            value={input.lumens}
            onChange={(n) => set("lumens", n)}
            min={1}
            max={100000}
            unit="lm"
          />
          <NumberField
            label="Primary watts per unit"
            value={input.watts}
            onChange={(n) => set("watts", n)}
            min={0.1}
            max={2000}
            step={0.1}
            unit="W"
          />
          <NumberField
            label="Primary quantity"
            value={input.quantity}
            onChange={(n) => set("quantity", n)}
            max={1000}
            help="0 = automatically sized"
          />
        </div>
      </article>
      {input.mixed &&
        input.layers.map((l, index) => {
          const isSecondary = l.role === "Secondary" || l.role === "Ambient";
          const role = isSecondary ? "Secondary" : l.role;
          return (
            <details
              key={l.id}
              className={`layer-row source-${role.toLowerCase()}`}
              open={
                role === "Secondary" || role === "Decorative" || l.quantity > 0
                  ? true
                  : undefined
              }
            >
              <summary className="source-summary">
                <span className={`source-badge ${role.toLowerCase()}-badge`}>
                  {String(index + 2).padStart(2, "0")} · {role.toUpperCase()}
                </span>
                <span>
                  {l.type}
                  <small>
                    {l.quantity} × {l.watts} W · {l.quantity * l.watts} W total
                  </small>
                </span>
                <ChevronDown size={18} />
              </summary>
              <div className="source-fields">
                <div className="source-explainer">
                  <FixtureIllustration type={l.type} />
                  <p>{layerDescriptions[l.role]}</p>
                </div>
                <div className="layer-row-heading">
                  <SelectField
                    label="Lighting role"
                    value={role}
                    options={["Secondary", "Decorative", "Task", "Accent"]}
                    onChange={(s) => change(l.id, { role: s as LayerRole })}
                  />
                  <button
                    className="btn remove-source"
                    aria-label={`Remove ${role} layer`}
                    onClick={() =>
                      set(
                        "layers",
                        input.layers.filter((x) => x.id !== l.id),
                      )
                    }
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
                <SelectField
                  label={`${role} fixture`}
                  value={l.type}
                  options={fixtureTypes}
                  onChange={(type) => {
                    const p = fixturePresets[type];
                    change(l.id, {
                      type,
                      lumens: p.lumens,
                      watts: p.watts,
                      ...(/cove|wall|decorative/i.test(type)
                        ? { contributes: false }
                        : {}),
                    });
                  }}
                />
                <div className="three-col lower-row">
                  <NumberField
                    label={`${role} quantity`}
                    value={l.quantity}
                    onChange={(n) => change(l.id, { quantity: n })}
                    max={1000}
                  />
                  <NumberField
                    label={`${role} lumens per unit`}
                    value={l.lumens}
                    onChange={(n) => change(l.id, { lumens: n })}
                    min={1}
                    max={100000}
                    unit="lm"
                  />
                  <NumberField
                    label={`${role} watts per unit`}
                    value={l.watts}
                    onChange={(n) => change(l.id, { watts: n })}
                    min={0.1}
                    max={2000}
                    step={0.1}
                    unit="W"
                  />
                </div>
                <div
                  className={`contribution-note ${l.contributes ? "counts" : "atmosphere"}`}
                >
                  <Lightbulb size={18} />
                  <div>
                    <strong>
                      {l.contributes
                        ? "Contributes to the room’s calculated lux"
                        : "Atmosphere / local lighting only"}
                    </strong>
                    <p>
                      {l.contributes
                        ? "This group reduces the number of primary fixtures needed, using its own utilization and maintenance factors."
                        : "This group adds to wattage and energy, but is not assumed to provide uniform light across the room."}
                    </p>
                  </div>
                </div>
                <Advanced title={`${role} calculation settings`}>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={l.contributes}
                      onChange={(e) =>
                        change(l.id, { contributes: e.target.checked })
                      }
                    />
                    Credit this group to the average task-plane illuminance
                  </label>
                  <p className="small muted">
                    Only credit light serving the same horizontal area. Cove
                    lighting, wall accents and focused task lights need suitable
                    photometric evidence before receiving whole-room credit.
                  </p>
                  <div className="two-col">
                    <NumberField
                      label={`${role} utilization factor`}
                      value={l.uf}
                      onChange={(n) => change(l.id, { uf: n })}
                      min={0.1}
                      max={1}
                      step={0.05}
                    />
                    <NumberField
                      label={`${role} maintenance factor`}
                      value={l.mf}
                      onChange={(n) => change(l.id, { mf: n })}
                      min={0.1}
                      max={1}
                      step={0.05}
                    />
                  </div>
                </Advanced>
              </div>
            </details>
          );
        })}
      {!input.mixed && (
        <div className="layer-empty">
          <Layers size={23} />
          <div>
            <strong>Add another source to this room</strong>
            <p>
              For example: primary spotlights + secondary magnetic track +
              decorative cove or wall lights.
            </p>
          </div>
        </div>
      )}
      <div className="add-source-actions">
        <button
          className="btn add-secondary"
          disabled={input.layers.length >= 12}
          onClick={() => add("Secondary")}
        >
          <Plus size={17} />
          Add secondary lighting
        </button>
        <button
          className="btn add-decorative"
          disabled={input.layers.length >= 12}
          onClick={() => add("Decorative")}
        >
          <Plus size={17} />
          Add decorative lighting
        </button>
      </div>
      <Advanced title="Optional task & accent sources">
        <div className="add-source-actions">
          <button
            className="btn secondary"
            disabled={input.layers.length >= 12}
            onClick={() => add("Task")}
          >
            <Plus size={17} />
            Add task lighting
          </button>
          <button
            className="btn secondary"
            disabled={input.layers.length >= 12}
            onClick={() => add("Accent")}
          >
            <Plus size={17} />
            Add accent lighting
          </button>
        </div>
      </Advanced>
    </section>
  );
}
