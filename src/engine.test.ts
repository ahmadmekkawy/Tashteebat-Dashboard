import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, defaults as appDefaults } from "./engine.ts";
const defaults = { ...appDefaults, lux: 150 };
test("lumen method includes utilization and maintenance losses", () => {
  const r = calculate(defaults);
  assert.equal(r.area, 20);
  assert.equal(r.lumens, 6250);
  assert.equal(r.count, 8);
  assert.equal(r.achieved, 153.6);
});
test("manual quantity changes achieved lux and power", () => {
  const r = calculate({ ...defaults, quantity: 4 });
  assert.equal(r.achieved, 76.8);
  assert.equal(r.power, 36);
});
test("beam footprint uses mounting height above working plane", () => {
  const r = calculate({ ...defaults, beam: 90 });
  assert.ok(Math.abs(r.diameter - 4.1) < 1e-9);
});
test("invalid inputs cannot yield a misleading result", () => {
  assert.throws(() => calculate({ ...defaults, lumens: 0 }));
  assert.throws(() => calculate({ ...defaults, mount: 0.5 }));
  assert.throws(() => calculate({ ...defaults, uf: 1.5 }));
});
test("daylight never reduces electric light sizing", () => {
  assert.equal(
    calculate({ ...defaults, daylight: "Abundant" }).count,
    calculate({ ...defaults, daylight: "Low" }).count,
  );
});
test("brightness preference scales the target and required lumens", () => {
  const r = calculate({ ...defaults, brightness: 1.5 });
  assert.equal(r.target, 225);
  assert.equal(r.lumens, 9375);
  assert.equal(r.count, 12);
});
test("reject impossible geometry, fractional quantities and invalid beam angles", () => {
  assert.throws(() => calculate({ ...defaults, plane: 3 }));
  assert.throws(() => calculate({ ...defaults, quantity: 2.5 }));
  assert.throws(() => calculate({ ...defaults, beam: 180 }));
  assert.throws(() => calculate({ ...defaults, length: NaN }));
});

test("source efficiency is applied once and luminaire output never double-counts it", () => {
  const base = calculate({
    ...defaults,
    sourceOutput: false,
    opticalEfficiency: 0.5,
  });
  const source = calculate({
    ...defaults,
    sourceOutput: true,
    opticalEfficiency: 0.5,
  });
  assert.equal(base.luminaireLumens, 800);
  assert.equal(source.luminaireLumens, 400);
  assert.equal(source.effective, 192);
  assert.equal(source.count, 16);
});
test("supplemental task lighting adds power but no ambient illuminance by default", () => {
  const r = calculate({
    ...defaults,
    mixed: true,
    layers: [
      {
        id: "t",
        role: "Task",
        type: "Table lamps",
        quantity: 2,
        lumens: 500,
        watts: 6,
        uf: 0.6,
        mf: 0.8,
        contributes: false,
      },
    ],
  });
  assert.equal(r.count, 8);
  assert.equal(r.achieved, 153.6);
  assert.equal(r.power, 84);
  assert.equal(r.totalUnits, 10);
});
test("explicit same-plane layer credit reduces primary requirement using its own UF and MF", () => {
  const r = calculate({
    ...defaults,
    mixed: true,
    layers: [
      {
        id: "t",
        role: "Ambient",
        type: "Downlights",
        quantity: 2,
        lumens: 1000,
        watts: 10,
        uf: 0.5,
        mf: 0.8,
        contributes: true,
      },
    ],
  });
  assert.equal(r.layerDelivered, 800);
  assert.equal(r.count, 6);
  assert.equal(r.achieved, 155.2);
  assert.equal(r.power, 74);
});
test("energy and power density use all enabled groups and real operating assumptions", () => {
  const r = calculate({
    ...defaults,
    hours: 5,
    days: 365,
    dimming: 0.5,
    tariff: 0.2,
  });
  assert.equal(r.powerDensity, 3.6);
  assert.ok(Math.abs(r.kwh - 65.7) < 1e-9);
  assert.ok(Math.abs(r.cost - 13.14) < 1e-9);
  const fixed = calculate({
    ...defaults,
    dimmable: false,
    dimming: 0.5,
    hours: 5,
    days: 365,
  });
  assert.equal(fixed.kwh, 131.4);
});
test("night and daylight scenes change advice, never the lumen requirement", () => {
  assert.equal(
    calculate({
      ...defaults,
      scene: "Night / ambience",
      daylight: "High natural light",
    }).count,
    calculate({ ...defaults, scene: "Daytime", daylight: "No natural light" })
      .count,
  );
});
test("outdoor incompatibility and missing names produce actionable errors", () => {
  assert.throws(() => calculate({ ...defaults, name: "  " }), /room name/);
  assert.throws(
    () => calculate({ ...defaults, outdoor: true, rating: "Indoor" }),
    /outdoor-rated/,
  );
  assert.throws(
    () =>
      calculate({ ...defaults, outdoor: true, rating: "Outdoor", ip: "IP20" }),
    /no water protection/,
  );
  assert.throws(
    () => calculate({ ...defaults, room: "Garden", outdoor: false }),
    /outdoors/,
  );
});
test("geometry affects room index and spacing without fabricated UF loss", () => {
  const a = calculate(defaults),
    b = calculate({ ...defaults, height: 4, mount: 4 });
  assert.equal(a.count, b.count);
  assert.ok(b.diameter > a.diameter);
  assert.ok(b.roomIndex < a.roomIndex);
  assert.ok(Math.abs(a.wallX - a.spacingX / 2) < 1e-9);
});
test("fully credited supplemental light can eliminate the primary ambient group", () => {
  const r = calculate({
    ...defaults,
    mixed: true,
    layers: [
      {
        id: "a",
        role: "Ambient",
        type: "Downlights",
        quantity: 10,
        lumens: 1000,
        watts: 10,
        uf: 0.8,
        mf: 0.8,
        contributes: true,
      },
    ],
  });
  assert.equal(r.count, 0);
  assert.equal(r.power, 100);
  assert.equal(r.cols, 0);
  assert.equal(r.achieved, 320);
});

test('secondary magnetic track reduces primary spotlight count while decorative cove and wall lights remain separate',()=>{const i={...defaults,lux:200,mixed:true,layers:[{id:'track',role:'Secondary' as const,type:'Magnetic track lighting',quantity:4,lumens:800,watts:9,uf:.6,mf:.8,contributes:true},{id:'cove',role:'Decorative' as const,type:'Cove lighting',quantity:2,lumens:1200,watts:12,uf:.25,mf:.8,contributes:false},{id:'wall',role:'Decorative' as const,type:'Wall-mounted lights',quantity:2,lumens:400,watts:5,uf:.3,mf:.8,contributes:false}]};const r=calculate(i);assert.equal(r.count,7);assert.equal(r.totalUnits,15);assert.equal(r.power,133);assert.equal(r.achieved,211.2);assert.equal(r.groups.length,4);assert.equal(r.groups.filter(g=>g.role==='Decorative').length,2);assert.equal(r.groups.reduce((n,g)=>n+g.power,0),r.power);assert.ok(r.groups.filter(g=>g.role==='Decorative').every(g=>g.maintainedLm===0));assert.equal(calculate({...i,layers:i.layers.map(l=>({...l,contributes:false}))}).count,11)});
