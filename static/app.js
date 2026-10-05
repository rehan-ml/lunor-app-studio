const STAGES = ["understand", "plan", "build", "explain", "learn"];

const state = {
  blueprint: null,
  currentStage: "understand",
  activeFile: null,
};

const elements = {
  ideaInput: document.querySelector("#ideaInput"),
  charCount: document.querySelector("#charCount"),
  generateButton: document.querySelector("#generateButton"),
  exportButton: document.querySelector("#exportButton"),
  experienceSelect: document.querySelector("#experienceSelect"),
  formError: document.querySelector("#formError"),
  stageContent: document.querySelector("#stageContent"),
  stageTabs: [...document.querySelectorAll(".stage-tab")],
  previewTitle: document.querySelector("#previewTitle"),
  phoneEyebrow: document.querySelector("#phoneEyebrow"),
  phoneGreeting: document.querySelector("#phoneGreeting"),
  phoneSubtitle: document.querySelector("#phoneSubtitle"),
  phoneCards: document.querySelector("#phoneCards"),
  phoneAction: document.querySelector("#phoneAction"),
  phoneTabs: document.querySelector("#phoneTabs"),
  miniProgress: document.querySelector("#miniProgress"),
  toast: document.querySelector("#toast"),
};

let toastTimer;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function titleCase(value) {
  return String(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

function selectedPayload() {
  return {
    prompt: elements.ideaInput.value.trim(),
    platform: document.querySelector('input[name="platform"]:checked').value,
    experience: elements.experienceSelect.value,
    constraints: [...document.querySelectorAll('.constraint-grid input:checked')].map(
      (input) => input.value,
    ),
  };
}

function setLoading(isLoading) {
  elements.generateButton.disabled = isLoading;
  elements.generateButton.innerHTML = isLoading
    ? "<span>Thinking through the product…</span><span>◌</span>"
    : "<span>Create app blueprint</span><span aria-hidden=\"true\">✦</span>";

  if (isLoading) {
    elements.stageContent.innerHTML = `
      <div class="loading-state">
        <div>
          <div class="loading-core">✦</div>
          <h2>Turning the idea into a buildable product</h2>
          <p>Finding the core user flow, architecture, and learning steps…</p>
        </div>
      </div>`;
  }
}

async function generateBlueprint() {
  const payload = selectedPayload();
  elements.formError.textContent = "";

  if (payload.prompt.length < 12) {
    elements.formError.textContent = "Describe the app idea in at least 12 characters.";
    elements.ideaInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/blueprint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Blueprint request failed (${response.status})`);
    state.blueprint = await response.json();
  } catch (error) {
    // The browser fallback keeps the prototype demonstrable on static hosting.
    state.blueprint = createLocalBlueprint(payload);
    showToast("Demo engine active — no API key needed");
  } finally {
    setLoading(false);
  }

  state.currentStage = "understand";
  state.activeFile = Object.keys(state.blueprint.build.files)[0];
  elements.exportButton.disabled = false;
  elements.stageTabs.forEach((tab) => tab.classList.add("complete"));
  updatePreview();
  renderStage();
}

function updatePreview() {
  const preview = state.blueprint.preview;
  elements.previewTitle.textContent = preview.name;
  elements.phoneEyebrow.textContent = preview.eyebrow;
  elements.phoneGreeting.textContent = preview.greeting;
  elements.phoneSubtitle.textContent = preview.subtitle;
  elements.phoneAction.textContent = preview.primaryAction;
  elements.phoneAction.disabled = false;
  elements.miniProgress.style.width = "68%";
  elements.phoneCards.innerHTML = preview.cards
    .map(
      (card, index) => `
        <div class="phone-card">
          <span class="card-check">${index === 0 ? "✓" : ""}</span>
          <div><strong>${escapeHtml(card)}</strong><small>${index === 0 ? "Done today" : "Ready when you are"}</small></div>
        </div>`,
    )
    .join("");
  elements.phoneTabs.innerHTML = preview.tabs
    .map((tab, index) => `<span class="${index === 0 ? "active" : ""}">${escapeHtml(tab)}</span>`)
    .join("");
}

function stageHeader(number, kicker, title, text, badge = "STRUCTURED") {
  return `
    <div class="stage-header">
      <div>
        <p class="kicker">${number} · ${escapeHtml(kicker)}</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(text)}</p>
      </div>
      <span class="confidence">${escapeHtml(badge)}</span>
    </div>`;
}

function stageFooter(message, nextLabel, nextStage) {
  return `
    <div class="stage-footer">
      <p>${escapeHtml(message)}</p>
      ${nextStage ? `<button class="next-button" data-next-stage="${nextStage}" type="button">${escapeHtml(nextLabel)} →</button>` : ""}
    </div>`;
}

function list(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderUnderstand() {
  const data = state.blueprint.understand;
  return `
    ${stageHeader("01", "UNDERSTAND", "Turn the prompt into a clear product", "Before writing code, Lunor identifies who the app is for, the real problem, and the smallest useful outcome.", "PROMPT GROUNDED")}
    <div class="content-grid">
      <article class="info-card span-two"><p class="card-label">YOUR IDEA, REFRAMED</p><h3>${escapeHtml(data.summary)}</h3></article>
      <article class="info-card"><p class="card-label">PROBLEM</p><p>${escapeHtml(data.problem)}</p></article>
      <article class="info-card"><p class="card-label">PRIMARY USER</p><p>${escapeHtml(data.audience)}</p></article>
      <article class="info-card span-two"><p class="card-label">CORE OUTCOME</p><h3>${escapeHtml(data.coreOutcome)}</h3></article>
      <article class="info-card"><p class="card-label">WORKING ASSUMPTIONS</p>${list(data.assumptions)}</article>
      <article class="info-card"><p class="card-label">QUESTIONS TO VALIDATE</p>${list(data.questions)}</article>
    </div>
    ${stageFooter("A precise problem prevents unnecessary features.", "Turn this into a plan", "plan")}`;
}

function renderPlan() {
  const data = state.blueprint.plan;
  const stack = Object.entries(data.stack)
    .map(([key, value]) => `<div class="stack-item"><small>${escapeHtml(titleCase(key))}</small><strong>${escapeHtml(value)}</strong></div>`)
    .join("");
  const architecture = data.architecture
    .map((item, index) => `${index ? "<b>→</b>" : ""}<span>${escapeHtml(item)}</span>`)
    .join("");
  const milestones = data.milestones
    .map((item) => `<div class="milestone"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.time)}</small></div>`)
    .join("");

  return `
    ${stageHeader("02", "PLAN", "Keep version one focused", "The plan separates the essential user value from features that can wait until real users validate the idea.", "MVP FIRST")}
    <div class="content-grid">
      <article class="info-card"><p class="card-label">VERSION 1 · BUILD NOW</p>${list(data.mvp)}</article>
      <article class="info-card"><p class="card-label">VERSION 2 · BUILD LATER</p>${list(data.later)}</article>
      <article class="info-card span-two"><p class="card-label">RECOMMENDED STACK</p><div class="stack-grid">${stack}</div></article>
      <article class="info-card span-two"><p class="card-label">SIMPLE ARCHITECTURE</p><div class="architecture-flow">${architecture}</div></article>
      <article class="info-card span-two"><p class="card-label">5-DAY BUILD ROADMAP</p><div class="milestone-row">${milestones}</div></article>
    </div>
    ${stageFooter("Every choice is intentionally small enough for a first prototype.", "Generate the starter build", "build")}`;
}

function renderBuild() {
  const data = state.blueprint.build;
  const fileNames = Object.keys(data.files);
  if (!state.activeFile || !data.files[state.activeFile]) state.activeFile = fileNames[0];
  const tabs = fileNames
    .map(
      (name) => `<button class="file-tab ${name === state.activeFile ? "active" : ""}" data-file="${escapeHtml(name)}" type="button">${escapeHtml(name)}</button>`,
    )
    .join("");
  const commands = data.commands
    .map((command, index) => `<div class="build-step"><span>STEP ${String(index + 1).padStart(2, "0")}</span>${escapeHtml(command)}</div>`)
    .join("");

  return `
    ${stageHeader("03", "BUILD", "Start with a readable project skeleton", "Lunor produces a small starter structure instead of pretending an entire production app is complete.", "STARTER CODE")}
    <div class="build-summary">${commands}</div>
    <div class="code-workspace">
      <div class="code-toolbar"><div class="file-tabs">${tabs}</div><button class="copy-code" type="button">Copy code</button></div>
      <pre><code>${escapeHtml(data.files[state.activeFile])}</code></pre>
    </div>
    ${stageFooter("The generated files show the first screen, data shape, and project entry point.", "Understand the decisions", "explain")}`;
}

function renderExplain() {
  const data = state.blueprint.explain;
  const decisions = data.decisions
    .map(
      (item, index) => `
        <article class="decision">
          <div class="decision-top"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.detail)}</p></div><span class="decision-number">0${index + 1}</span></div>
        </article>`,
    )
    .join("");

  return `
    ${stageHeader("04", "EXPLAIN", "Know why the app is built this way", "A useful AI development tool should teach the reasoning behind its choices, including the compromises.", "NO BLACK BOX")}
    <div class="decision-list">${decisions}</div>
    <aside class="tradeoff-box"><h3>Trade-offs to remember</h3>${list(data.tradeoffs)}</aside>
    ${stageFooter("Understanding the structure makes the generated code maintainable.", "Create my learning path", "learn")}`;
}

function renderLearn() {
  const data = state.blueprint.learn;
  const path = data.path
    .map(
      (item) => `
        <div class="learning-item">
          <span class="learning-step">0${item.step}</span>
          <div><h3>${escapeHtml(item.title)}</h3><p>Complete this using the generated starter project.</p></div>
          <span class="duration">${escapeHtml(item.duration)}</span>
        </div>`,
    )
    .join("");

  return `
    ${stageHeader("05", "LEARN", "Build the app while learning the right concepts", "The roadmap connects each technical idea to something visible in this exact project.", "PROJECT BASED")}
    <div class="learning-path">${path}</div>
    <aside class="checkpoint"><strong>NEXT CONCEPT · ${escapeHtml(data.nextConcept)}</strong><p>${escapeHtml(data.checkpoint)}</p></aside>
    ${stageFooter("You now have a problem definition, plan, starter build, reasoning, and study path.", "", null)}`;
}

function renderStage() {
  if (!state.blueprint) return;
  const renderers = {
    understand: renderUnderstand,
    plan: renderPlan,
    build: renderBuild,
    explain: renderExplain,
    learn: renderLearn,
  };
  elements.stageContent.innerHTML = renderers[state.currentStage]();
  elements.stageTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.stage === state.currentStage));
  elements.stageContent.scrollTop = 0;
}

function exportBlueprint() {
  if (!state.blueprint) return;
  const blob = new Blob([JSON.stringify(state.blueprint, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.blueprint.meta.appName.toLowerCase()}-blueprint.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Blueprint exported as JSON");
}

function createLocalBlueprint(payload) {
  const text = payload.prompt.toLowerCase();
  let domain = {
    name: "IdeaFlow",
    entity: "item",
    audience: "people who want a simpler way to complete this task",
    value: "turn a repeated problem into a clear mobile workflow",
    tabs: ["Home", "Activity", "Profile"],
    cards: ["Getting started", "Recent activity", "Next step"],
  };

  if (/habit|routine|streak|goal/.test(text)) {
    domain = { name: "Momentum", entity: "habit", audience: "students building consistent routines", value: "make small goals visible and easier to repeat", tabs: ["Today", "Progress", "Profile"], cards: ["Morning walk", "Read 20 minutes", "Drink water"] };
  } else if (/expense|budget|money|finance/.test(text)) {
    domain = { name: "PocketLens", entity: "expense", audience: "students tracking everyday spending", value: "turn daily expenses into a clear monthly picture", tabs: ["Overview", "Activity", "Budgets"], cards: ["Food & dining", "Transport", "Subscriptions"] };
  } else if (/study|revision|exam|learn/.test(text)) {
    domain = { name: "FocusDeck", entity: "study session", audience: "students planning revision around deadlines", value: "convert a syllabus into focused daily sessions", tabs: ["Plan", "Focus", "Insights"], cards: ["Machine Learning", "Operating Systems", "DSA practice"] };
  }

  const stacks = {
    "cross-platform": { client: "Flutter + Dart", state: "Riverpod", storage: "SQLite via Drift", testing: "Flutter test" },
    android: { client: "Kotlin + Jetpack Compose", state: "ViewModel + StateFlow", storage: "Room database", testing: "JUnit + Compose UI tests" },
    ios: { client: "Swift + SwiftUI", state: "Observable + async/await", storage: "SwiftData", testing: "XCTest + UI tests" },
  };
  const stack = stacks[payload.platform];
  const code = `import 'package:flutter/material.dart';\n\nvoid main() => runApp(const ${domain.name}App());\n\nclass ${domain.name}App extends StatelessWidget {\n  const ${domain.name}App({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      debugShowCheckedModeBanner: false,\n      theme: ThemeData.dark(useMaterial3: true),\n      home: const Scaffold(\n        body: Center(child: Text('${domain.name}')),\n      ),\n    );\n  }\n}`;

  return {
    meta: { appName: domain.name, mode: "Browser demo engine", platform: payload.platform, experience: payload.experience },
    understand: {
      summary: payload.prompt,
      problem: `The user needs a simpler way to ${domain.value}.`,
      audience: domain.audience,
      coreOutcome: `A user can create, review, and act on one ${domain.entity} in under a minute.`,
      assumptions: ["The first version supports one primary user role.", "Account creation waits until cloud sync is needed.", `Constraints: ${payload.constraints.join(", ") || "none selected"}.`],
      questions: ["What action happens most often?", "What must work offline?", "What makes a user return tomorrow?"],
    },
    plan: {
      mvp: [`Create and edit a ${domain.entity}`, "Focused home dashboard", "Local persistence", "Accessible empty and error states"],
      later: ["Authentication and sync", "Smart recommendations", "Configurable notifications"],
      stack,
      architecture: ["Mobile UI", "State layer", "Repository", "Local database", "Optional API"],
      milestones: [{ name: "Clickable flow", time: "Day 1" }, { name: "Local MVP", time: "Days 2–3" }, { name: "Test & refine", time: "Day 4" }, { name: "Beta build", time: "Day 5" }],
    },
    build: { files: { "lib/main.dart": code, "lib/models/app_item.dart": "class AppItem {\n  final String id;\n  final String title;\n  const AppItem(this.id, this.title);\n}" }, commands: ["Create project", "Add local storage", "Run tests", "Build release"] },
    explain: {
      decisions: [{ title: "Start local-first", detail: "The core flow remains useful without sign-in or internet." }, { title: `Use ${stack.client}`, detail: "It matches the selected platform while keeping version one small." }, { title: "Separate UI from data", detail: "Storage and APIs can change without rebuilding every screen." }],
      tradeoffs: ["Local-first is quick, but cloud sync becomes a later migration.", "A focused MVP supports fewer cases, but gives clearer user feedback."],
    },
    learn: {
      path: [{ step: 1, title: "Understand the UI structure", duration: "25 min" }, { step: 2, title: "Build the first screen", duration: "45 min" }, { step: 3, title: "Connect state to the UI", duration: "40 min" }, { step: 4, title: "Save data locally", duration: "50 min" }, { step: 5, title: "Test one user flow", duration: "35 min" }],
      nextConcept: "State management",
      checkpoint: "Explain how one tap moves data from the UI to local storage.",
    },
    preview: { name: domain.name, eyebrow: "TODAY", greeting: "Good afternoon", subtitle: domain.value[0].toUpperCase() + domain.value.slice(1), tabs: domain.tabs, cards: domain.cards, primaryAction: `Add ${domain.entity}` },
  };
}

elements.ideaInput.addEventListener("input", () => {
  elements.charCount.textContent = `${elements.ideaInput.value.length} / 1200`;
  elements.formError.textContent = "";
});

elements.ideaInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") generateBlueprint();
});

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    elements.ideaInput.value = chip.dataset.prompt;
    elements.ideaInput.dispatchEvent(new Event("input"));
    elements.ideaInput.focus();
  });
});

elements.generateButton.addEventListener("click", generateBlueprint);
elements.exportButton.addEventListener("click", exportBlueprint);

elements.stageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (!state.blueprint) {
      showToast("Create a blueprint first");
      return;
    }
    state.currentStage = tab.dataset.stage;
    renderStage();
  });
});

elements.stageContent.addEventListener("click", async (event) => {
  const next = event.target.closest("[data-next-stage]");
  if (next) {
    state.currentStage = next.dataset.nextStage;
    renderStage();
    return;
  }

  const fileTab = event.target.closest("[data-file]");
  if (fileTab) {
    state.activeFile = fileTab.dataset.file;
    renderStage();
    return;
  }

  if (event.target.closest(".copy-code")) {
    try {
      await navigator.clipboard.writeText(state.blueprint.build.files[state.activeFile]);
      showToast("Code copied");
    } catch {
      showToast("Select the code and copy it manually");
    }
  }
});

elements.phoneAction.addEventListener("click", () => showToast("Preview action — ready for implementation"));
