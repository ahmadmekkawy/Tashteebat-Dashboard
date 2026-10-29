import { test } from "node:test";
import assert from "node:assert/strict";
import { defaults, calculate } from "./engine";
import { recommend, guidance } from "./recommendation";
import { rooms, roomGuidance, fixtureTypes } from "./data/catalog";
import { normalizeInputs } from "./engine";
import { reportText } from "./report";
test("all room presets produce valid plans with primary, secondary and optional layer roles and advisory context", () => {
  for (const room of rooms) {
    const i = recommend({
      ...defaults,
      room: room[0],
      outdoor: roomGuidance[room[0]].outdoor,
    });
    const r = calculate(i);
    assert.ok(r.count > 0);
    assert.ok(fixtureTypes.includes(i.type));
    assert.equal(i.layers.length, 4);
    assert.equal(
      i.layers.find(l=>l.role==='Secondary')?.contributes,
      true,
    );
    assert.equal(i.layers.some(l=>l.role==='Decorative'&&l.contributes),false);
    assert.ok(guidance(i).range.includes("–"));
  }
});
test("atmosphere changes CCT and layering, not arbitrary task lux reduction", () => {
  const calm = recommend({ ...defaults, goal: "atmospheric" });
  assert.equal(calm.lux, 200);
  assert.equal(calm.kelvin, 2700);
  const bright = recommend({ ...defaults, goal: "bright" });
  assert.equal(bright.lux, 300);
});
test("outdoor facade recommendations use facade fixtures with outdoor protection", () => {
  const i = recommend({ ...defaults, room: "Facade", outdoor: true });
  assert.equal(i.type, "Facade lights");
  assert.equal(i.rating, "Outdoor");
  assert.equal(i.ip, "IP65");
});
test("legacy projects are merged with current defaults and daylight labels", () => {
  const i = normalizeInputs({
    name: "Old plan",
    lux: 150,
    daylight: "Moderate",
  });
  assert.equal(i.daylight, "Medium natural light");
  assert.equal(i.hours, 5);
  assert.equal(calculate(i).count, 8);
});
test("reports include exact assumptions, operating inputs and the professional disclaimer", () => {
  const s = reportText(recommend(defaults));
  assert.ok(s.includes("UF 0.6"));
  assert.ok(s.includes("local currency"));
  assert.ok(s.includes("qualified lighting designer"));
  assert.ok(s.includes("Decorative:"));
});

test("legacy projects with newly flagged outdoor settings remain available to correct", async () => {
  const { readProjects } = await import("./storage");
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () =>
        JSON.stringify([
          {
            id: "legacy",
            date: "2026-10-27",
            inputs: {
              ...defaults,
              name: "Legacy outdoor",
              outdoor: true,
              rating: "Indoor",
              ip: "IP20",
            },
          },
        ]),
    },
  });
  try {
    const stored = readProjects();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].inputs.name, "Legacy outdoor");
    assert.throws(() => calculate(stored[0].inputs), /outdoor-rated/);
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test('older ambient supplemental groups migrate to explicit secondary sources',()=>{const old=normalizeInputs({...defaults,mixed:true,layers:[{id:'legacy',role:'Ambient',type:'Magnetic track lighting',quantity:2,lumens:800,watts:9,uf:.6,mf:.8,contributes:true}]});assert.equal(old.layers[0].role,'Secondary');assert.equal(calculate(old).groups[1].role,'Secondary')});
