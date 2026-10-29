import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Sun,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Plus,
  FolderOpen,
  SlidersHorizontal,
  Check,
  Lightbulb,
  Download,
  Bookmark,
  Info,
  Trash2,
  Menu,
  CheckCircle2,
  Sparkles,
  Copy,
  Printer,
  Star,
  ArrowRightLeft,
  RotateCcw,
} from "lucide-react";
import { Inputs, calculate, defaults, normalizeInputs } from "./engine";
import {
  fixtureTypes,
  fixturePresets,
  roomGuidance,
  rooms,
  disclaimer,
} from "./data/catalog";
import { recommend } from "./recommendation";
import { Project, readProjects, readRecent, makeId } from "./storage";
import { reportText, downloadText } from "./report";
import { GuidedForms, Plan } from "./components/GuidedForms";
import { KnowledgeDialog } from "./components/KnowledgeDialog";
import { Summary, DetailedResults } from "./components/Results";
import { LightingLayout } from "./components/LightingLayout";
import { Comparison } from "./components/Comparison";
import { EnergyEstimator } from "./components/EnergyEstimator";
import "./style.css";
const steps = [
  "Space",
  "Lighting goal",
  "Fixture preference",
  "Technical details",
  "Results",
];
const titles = [
  "Tell us about your space",
  "Set the feeling, keep the function",
  "Find the right mix of light",
  "Make the details work for you",
  "Your lighting plan, brought together",
];
const descriptions = [
  "A few dimensions. A much better starting point.",
  "Great light serves both the task and the atmosphere.",
  "Choose a fixture, or let us create a layered starting plan.",
  "Sensible defaults, with room for professional judgement.",
  "A transparent estimate, a layered strategy, a clearer next step.",
];
function App() {
  const [input, setInput] = useState<Inputs>(() =>
    normalizeInputs({ ...defaults }),
  );
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<"calculator" | "projects">("calculator");
  const [smart, setSmart] = useState(true);
  const [modal, setModal] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [projects, setProjects] = useState<Project[]>(readProjects);
  const [recent, setRecent] = useState(() =>
    readRecent().filter((t) => fixtureTypes.includes(t)),
  );
  const [plan, setPlan] = useState<Plan>();
  const [comparison, setComparison] = useState<Inputs>();
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [busyDownload, setBusyDownload] = useState(false);
  const closeModal = useCallback(() => setModal(false), []);
  function set<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInput((i) => ({ ...i, [key]: value }));
  }
  function notify(s: string) {
    setToast(s);
    setTimeout(() => setToast(""), 4000);
  }
  let r: ReturnType<typeof calculate> | undefined,
    error = "";
  try {
    r = calculate(input);
  } catch (e) {
    error = (e as Error).message;
  }
  function persist(next: Project[]) {
    try {
      localStorage.setItem("luma-projects", JSON.stringify(next));
      setProjects(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "Browser storage is unavailable or full. Export your report to keep a copy.",
      );
      return false;
    }
  }
  function remember(type: string) {
    const next = [type, ...recent.filter((t) => t !== type)].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem("luma-recent", JSON.stringify(next));
    } catch {
      /* Recently used fixtures are optional; project saving reports storage errors. */
    }
  }
  function selectFixture(type: string) {
    const p = fixturePresets[type];
    setInput((i) => ({
      ...i,
      type,
      lumens: p.lumens,
      watts: p.watts,
      beam: p.beam,
      dimension: p.kind === "linear" ? 1000 : 90,
      rating: p.outdoor ? "Outdoor" : i.rating,
    }));
    remember(type);
  }
  function save() {
    if (!r) {
      notify("Correct the inputs before saving.");
      return;
    }
    if (
      persist([
        {
          id: makeId(),
          date: new Date().toISOString(),
          inputs: structuredClone(input),
        },
        ...projects,
      ])
    ) {
      remember(input.type);
      notify("Lighting project saved on this device.");
    }
  }
  function clearPlan() {
    if (plan?.url) URL.revokeObjectURL(plan.url);
    setPlan(undefined);
  }
  function reset() {
    setInput(normalizeInputs({ ...defaults }));
    setSmart(true);
    setStep(0);
    setTab("calculator");
    setComparison(undefined);
    clearPlan();
    notify("A new lighting plan, ready for you.");
  }
  function applyRecommendation() {
    try {
      const next = recommend(input);
      calculate(next);
      setInput(next);
      remember(next.type);
      notify("A layered starting plan has been recommended.");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  function next() {
    if (!r) {
      notify(error);
      return;
    }
    if (step === 1 && smart) {
      const next = recommend(input);
      setInput(next);
      remember(next.type);
    }
    setStep((s) => Math.min(4, s + 1));
  }
  function open(p: Project, duplicate = false) {
    setInput(
      normalizeInputs({
        ...structuredClone(p.inputs),
        name: duplicate ? `${p.inputs.name} · copy` : p.inputs.name,
      }),
    );
    setSmart(false);
    setStep(duplicate ? 0 : 4);
    setTab("calculator");
    setMobile(false);
    clearPlan();
    if (duplicate)
      notify("Room duplicated. Edit it, then save as a new project.");
  }
  async function copySummary() {
    if (!r) return;
    const text = reportText(input);
    try {
      if (navigator.clipboard?.writeText)
        await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement("textarea");
        area.value = text;
        document.body.appendChild(area);
        area.select();
        if (!document.execCommand("copy")) throw new Error();
        area.remove();
      }
      notify("Lighting summary copied.");
    } catch {
      notify("Clipboard unavailable. Use Export report instead.");
    }
  }
  function printReport() {
    setStep(4);
    setTimeout(() => {
      const disclosures = [
        ...document.querySelectorAll<HTMLDetailsElement>("main details"),
      ];
      const states = disclosures.map((d) => d.open);
      disclosures.forEach((d) => (d.open = true));
      const restore = () =>
        disclosures.forEach((d, index) => (d.open = states[index]));
      window.addEventListener("afterprint", restore, { once: true });
      window.print();
    }, 100);
  }
  function exportReport() {
    if (!r) return;
    downloadText(
      reportText(input),
      `luma-${input.name.replace(/[^a-z0-9]/gi, "-")}.txt`,
    );
    notify("Lighting report exported.");
  }
  async function downloadPackage(name: string) {
    setBusyDownload(true);
    try {
      const res = await fetch(`/downloads/${name}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      if (name.endsWith(".zip") && blob.type.includes("text/html"))
        throw new Error();
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      notify("Your download is ready.");
    } catch {
      notify("Download unavailable. Refresh the app and try again.");
    } finally {
      setBusyDownload(false);
    }
  }
  const g = roomGuidance[input.room];
  const below = r && r.achieved + 0.01 < r.target;
  const showDownloads = !document.querySelector('meta[name="luma-standalone"]');
  return (
    <div className="app">
      {mobile && (
        <button
          className="navigation-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setTab("calculator");
            setMobile(false);
          }}
        >
          <div className="brand-icon">
            <Sun size={25} />
          </div>
          <span>
            luma<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="brand-sub">LIGHTING STUDIO</div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          <button
            className={`nav-item ${tab === "calculator" ? "selected" : ""}`}
            onClick={() => {
              setTab("calculator");
              setMobile(false);
            }}
          >
            <SlidersHorizontal size={18} />
            Lighting calculator
            <span className="nav-dot" />
          </button>
          <button
            className={`nav-item ${tab === "projects" ? "selected" : ""}`}
            onClick={() => {
              setTab("projects");
              setMobile(false);
            }}
          >
            <FolderOpen size={18} />
            My projects<span className="count">{projects.length}</span>
          </button>
          <button
            className="nav-item"
            onClick={() => {
              setModal(true);
              setMobile(false);
            }}
          >
            <Lightbulb size={18} />
            Lighting guide
            <ArrowUpRight size={15} className="nav-end" />
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-icon">
            <Sun size={20} />
          </div>
          <h3>
            Good light changes
            <br />
            everything.
          </h3>
          <p>
            A little science. A little intention.
            <br />A space that feels just right.
          </p>
          <button onClick={() => setModal(true)}>
            Explore the basics <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" />
          Made for brighter spaces<span>v2.1</span>
        </div>
      </aside>
      <div className="main-shell">
        <header>
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-btn"
              aria-label="Open navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            Workspace<span>/</span>
            <strong>
              {tab === "projects" ? "My projects" : "Lighting calculator"}
            </strong>
          </div>
          <div className="header-right">
            <span className="local-status">
              <span className="status-dot" />
              Local-first. No account needed.
            </span>
            <span className="avatar">LM</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">A LITTLE SCIENCE. A BETTER SPACE.</div>
              <h1>
                {tab === "projects"
                  ? "Your brighter ideas."
                  : "Find your space’s perfect light."}
              </h1>
              <p>
                {tab === "projects"
                  ? "Revisit, duplicate and compare your saved lighting plans."
                  : "Plan primary, secondary and decorative light for a room that feels right."}
              </p>
            </div>
            <div className="page-actions">
              {showDownloads && (
                <>
                  <button
                    className="btn secondary"
                    disabled={busyDownload}
                    onClick={() =>
                      downloadPackage("Luma-Lighting-Calculator.html")
                    }
                  >
                    <Download size={15} />
                    Download HTML
                  </button>
                  <button
                    className="btn secondary"
                    disabled={busyDownload}
                    onClick={() => downloadPackage("Luma-Source-Code.zip")}
                  >
                    <Download size={15} />
                    Source ZIP
                  </button>
                </>
              )}
              <button className="btn secondary" onClick={reset}>
                <Plus size={15} />
                New calculation
              </button>
            </div>
          </div>
          {storageError && (
            <p className="error" role="alert">
              {storageError}
            </p>
          )}
          {tab === "projects" ? (
            <>
              <div className="projects-toolbar">
                <span>
                  {projects.length} saved{" "}
                  {projects.length === 1 ? "project" : "projects"}
                </span>
                <button
                  className={`btn secondary ${favoritesOnly ? "chosen" : ""}`}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                >
                  <Star
                    size={14}
                    fill={favoritesOnly ? "currentColor" : "none"}
                  />
                  {favoritesOnly ? "Favorites only" : "Show favorites"}
                </button>
              </div>
              <div className="projects">
                {projects.filter((p) => !favoritesOnly || p.favorite).length ===
                0 ? (
                  <div className="empty">
                    <FolderOpen size={42} />
                    <h2>
                      {favoritesOnly
                        ? "Your favorites, together."
                        : "A home for your lighting plans."}
                    </h2>
                    <p>
                      {favoritesOnly
                        ? "Star a saved project to keep it close."
                        : "Save a calculation and it will appear here."}
                    </p>
                    <button className="btn primary" onClick={reset}>
                      Start a lighting plan <ArrowRight size={15} />
                    </button>
                  </div>
                ) : (
                  projects
                    .filter((p) => !favoritesOnly || p.favorite)
                    .map((p) => (
                      <article className="project-card" key={p.id}>
                        <div className="project-top">
                          <div className="section-icon">
                            <Lightbulb size={21} />
                          </div>
                          <button
                            className="icon-btn"
                            aria-label={`${p.favorite ? "Unfavorite" : "Favorite"} ${p.inputs.name}`}
                            onClick={() =>
                              persist(
                                projects.map((x) =>
                                  x.id === p.id
                                    ? { ...x, favorite: !x.favorite }
                                    : x,
                                ),
                              )
                            }
                          >
                            <Star
                              size={18}
                              fill={p.favorite ? "#c6a66c" : "none"}
                            />
                          </button>
                        </div>
                        <h2>{p.inputs.name}</h2>
                        <p>
                          {p.inputs.room} ·{" "}
                          {(p.inputs.length * p.inputs.width).toFixed(1)} m² ·{" "}
                          {p.inputs.kelvin} K
                        </p>
                        <small>{new Date(p.date).toLocaleDateString()}</small>
                        <div className="project-actions">
                          <button
                            className="btn primary"
                            onClick={() => open(p)}
                          >
                            Open plan <ArrowRight size={14} />
                          </button>
                          <button
                            className="icon-btn"
                            aria-label={`Delete ${p.inputs.name}`}
                            onClick={() =>
                              persist(projects.filter((x) => x.id !== p.id))
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <div className="project-secondary">
                          <button onClick={() => open(p, true)}>
                            <Copy size={13} />
                            Duplicate room
                          </button>
                          <button
                            onClick={() => {
                              setComparison(structuredClone(p.inputs));
                              setTab("calculator");
                              setStep(4);
                              notify(
                                "Saved plan pinned as Option A. Current plan is Option B.",
                              );
                            }}
                          >
                            <ArrowRightLeft size={13} />
                            Compare
                          </button>
                        </div>
                      </article>
                    ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mode-banner">
                <Sparkles size={20} />
                <div>
                  <strong>
                    {smart ? "Recommend for Me" : "Design it your way"}
                  </strong>
                  <p>
                    {smart
                      ? "Start with your room and atmosphere. We’ll suggest a complete layered plan."
                      : "Set every parameter, with transparent assumptions at each step."}
                  </p>
                </div>
                <button
                  className="btn secondary"
                  onClick={() => setSmart(!smart)}
                >
                  {smart ? "Switch to manual" : "Recommend for Me"}
                </button>
              </div>
              <div className="steps five-steps" aria-label="Calculation steps">
                {steps.map((label, j) => (
                  <button
                    key={label}
                    aria-current={j === step ? "step" : undefined}
                    className={`step ${step === j ? "active" : ""} ${step > j ? "complete" : ""}`}
                    onClick={() => {
                      if (j === 4 && !r) {
                        notify(error);
                        return;
                      }
                      setStep(j);
                    }}
                  >
                    <span className="step-num">
                      {step > j ? (
                        <Check size={13} />
                      ) : (
                        String(j + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>{label}</span>
                    {j < 4 && <span className="step-line" />}
                  </button>
                ))}
              </div>
              <div className="calculator-grid">
                <section className="form-card">
                  <div className="card-heading">
                    <div className="section-icon">
                      {step === 0 ? (
                        <SlidersHorizontal size={20} />
                      ) : step === 4 ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Lightbulb size={20} />
                      )}
                    </div>
                    <div>
                      <h2>{titles[step]}</h2>
                      <p>{descriptions[step]}</p>
                    </div>
                    <span className="section-counter">0{step + 1} / 05</span>
                  </div>
                  {step < 4 ? (
                    <GuidedForms
                      input={input}
                      set={set}
                      setAll={setInput}
                      step={step}
                      smart={smart}
                      setSmart={setSmart}
                      applyRecommendation={applyRecommendation}
                      selectFixture={selectFixture}
                      recent={recent}
                      plan={plan}
                      setPlan={setPlan}
                      notify={notify}
                    />
                  ) : r ? (
                    <div className="result-intro">
                      <div className="success-heading">
                        <CheckCircle2 size={20} />
                        <span>Your preliminary design is calculated</span>
                      </div>
                      <h3>{input.name}</h3>
                      <p>
                        {input.length.toFixed(1)} × {input.width.toFixed(1)} m ·{" "}
                        {r.area.toFixed(1)} m² ·{" "}
                        {input.outdoor ? "Outdoor" : "Indoor"}
                      </p>
                      <div className="result-tags">
                        <span>{input.kelvin} K selected</span>
                        <span>
                          {g.cct[0]}–{g.cct[1]} K suggested
                        </span>
                        <span>
                          {input.mixed
                            ? "Layered solution"
                            : "Single primary group"}
                        </span>
                      </div>
                      <p>
                        {r.count} primary ambient fixtures plus{" "}
                        {r.totalUnits - r.installed} supplemental units.
                        Estimated achieved average:{" "}
                        <b>{Math.round(r.achieved)} lux</b>, against a selected
                        target of {Math.round(r.target)} lux.
                      </p>
                      <p className="small muted">
                        Review the strategy, layout, energy and detailed
                        assumptions below. Fixture counts are preliminary
                        estimates, not construction instructions.
                      </p>
                      <div className="result-tools">
                        <button
                          className="btn secondary"
                          onClick={() => {
                            setInput({
                              ...structuredClone(input),
                              name: `${input.name} · copy`,
                            });
                            setStep(0);
                            setSmart(false);
                            notify(
                              "Editable room copy created. Save it as a new project.",
                            );
                          }}
                        >
                          <Copy size={14} />
                          Duplicate room
                        </button>
                        <button
                          className="btn secondary"
                          onClick={() => {
                            setComparison(structuredClone(input));
                            notify(
                              "Option A pinned. Change fixtures or settings to compare Option B.",
                            );
                          }}
                        >
                          <ArrowRightLeft size={14} />
                          Pin as option A
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="error">{error}</p>
                  )}
                  <div className="form-bottom">
                    <button
                      className="text-button"
                      onClick={() =>
                        step > 0 ? setStep(step - 1) : setModal(true)
                      }
                    >
                      {step > 0 ? <ArrowLeft size={14} /> : <Info size={14} />}{" "}
                      {step > 0 ? "Previous step" : "Methodology & sources"}
                    </button>
                    {step < 4 ? (
                      <button className="btn primary" onClick={next}>
                        {step === 3
                          ? "See your lighting plan"
                          : `Continue to ${steps[step + 1].toLowerCase()}`}
                        <ArrowRight size={15} />
                      </button>
                    ) : (
                      <button
                        className="btn primary"
                        disabled={!r}
                        onClick={save}
                      >
                        <Bookmark size={15} />
                        Save project
                      </button>
                    )}
                  </div>
                </section>
                <aside className="results-column">
                  <Summary
                    input={input}
                    r={r}
                    error={error}
                    onMethod={() => setModal(true)}
                  />
                  {step !== 4 && <LightingLayout input={input} r={r} />}
                  <div className="trust-note">
                    <Info size={15} />
                    <p>
                      Preliminary design guidance, not a photometric study. All
                      assumptions stay visible.
                      <button onClick={() => setModal(true)}>
                        See methodology & references <ArrowUpRight size={12} />
                      </button>
                    </p>
                  </div>
                </aside>
              </div>
              {r &&
                (input.brightness < 1 ||
                  input.lux < g.min ||
                  below ||
                  input.room === "Facade" ||
                  input.cri < 80) && (
                  <div className="warning" role="status">
                    <Info size={17} />
                    <div>
                      {below && (
                        <p>
                          The planned primary quantity does not meet your
                          selected average illuminance target.
                        </p>
                      )}
                      {(input.brightness < 1 || input.lux < g.min) && (
                        <p>
                          Your target is below the starting design guidance.
                          Verify task and regulatory requirements.
                        </p>
                      )}
                      {input.room === "Facade" && (
                        <p>
                          Facade illumination is a vertical-surface problem.
                          This horizontal lumen estimate cannot establish facade
                          lux or uniformity.
                        </p>
                      )}
                      {input.cri < 80 && (
                        <p>
                          Low CRI may compromise color appearance. Review the
                          task and applicable minimum color rendering
                          requirements.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              {comparison && (
                <Comparison
                  a={comparison}
                  b={input}
                  close={() => setComparison(undefined)}
                />
              )}
              {step === 4 ? (
                <>
                  {r && (
                    <DetailedResults
                      input={input}
                      r={r}
                      onMethod={() => setModal(true)}
                    />
                  )}
                  <EnergyEstimator input={input} r={r} set={set} />
                </>
              ) : (
                <section className="next-note">
                  <div>
                    <span className="eyebrow">
                      DESIGN A ROOM, NOT JUST A CEILING
                    </span>
                    <h2>Four layers. One comfortable space.</h2>
                    <p>
                      Ambient for balance. Task for clarity. Accent for depth.
                      Decorative for character.
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setModal(true)}
                  >
                    Understand lighting layers <ArrowUpRight size={15} />
                  </button>
                </section>
              )}
              <div className="bottom-bar">
                <div>
                  <Info size={16} />
                  <p>
                    Built on the lumen method. Designed for early decisions.
                    <button onClick={() => setModal(true)}>
                      Formulas, assumptions & sources
                    </button>
                  </p>
                </div>
                <div className="export-actions">
                  <button
                    className="btn secondary"
                    disabled={!r}
                    onClick={copySummary}
                  >
                    <Copy size={14} />
                    Copy summary
                  </button>
                  <button
                    className="btn secondary"
                    disabled={!r}
                    onClick={printReport}
                  >
                    <Printer size={14} />
                    Print / PDF
                  </button>
                  <button
                    className="btn secondary"
                    disabled={!r}
                    onClick={exportReport}
                  >
                    <Download size={14} />
                    Export report
                  </button>
                  <button className="btn primary" disabled={!r} onClick={save}>
                    <Bookmark size={14} />
                    Save project
                  </button>
                </div>
              </div>
              <p className="professional-disclaimer">{disclaimer}</p>
            </>
          )}
          <footer>
            <span className="footer-logo">luma.</span>
            <span>Thoughtful lighting. Confident decisions.</span>
            <button onClick={() => setModal(true)}>
              Methodology & sources <ArrowUpRight size={12} />
            </button>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {modal && <KnowledgeDialog close={closeModal} />}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
if (
  "serviceWorker" in navigator &&
  import.meta.env.PROD &&
  !document.querySelector('meta[name="luma-standalone"]')
)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {}),
  );
