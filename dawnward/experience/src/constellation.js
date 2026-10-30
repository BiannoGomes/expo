// The Memory Constellation: PROTOTYPE on sample data.
// Each star has the shape of the app's real /constellation rows
// (id, occurredAt, domain, weight; server/src/routes/constellation.ts). Text,
// links between moments, rejecting a link, removing a moment and switching
// connections off do not exist in the app yet; they are shown here, labelled,
// so they can be judged before they are built. Nothing leaves the page.
import { worlds } from "./tokens.js";

const SAMPLE = [
  { id: "m1", occurredAt: "2026-09-29", domain: "body", weight: 0.7, text: "40 minutes in the cold water. Head clear after." },
  { id: "m2", occurredAt: "2026-09-30", domain: "mind", weight: 0.7, text: "Wrote 900 words before work." },
  { id: "m3", occurredAt: "2026-10-03", domain: "mind", weight: 0.45, text: "Couldn't focus. Kept rewriting the same page." },
  { id: "m4", occurredAt: "2026-10-06", domain: "soul", weight: 0.45, text: "Short with Sam at dinner. Long day." },
  { id: "m5", occurredAt: "2026-10-08", domain: "future", weight: 0.4, text: "Pictured the book on a shelf with my name on it." },
  { id: "m6", occurredAt: "2026-10-13", domain: "body", weight: 0.45, text: "Skipped the swim. Slept five hours." },
  { id: "m7", occurredAt: "2026-10-13", domain: "soul", weight: 1, text: "Snapped at my sister again. Don't know why." },
  { id: "m8", occurredAt: "2026-10-14", domain: "soul", weight: 0.7, text: "Called my sister. Just to talk. We laughed about Mum's garden." },
  { id: "m9", occurredAt: "2026-10-18", domain: "body", weight: 0.7, text: "Back in the water. 40 minutes." },
  { id: "m10", occurredAt: "2026-10-19", domain: "mind", weight: 0.7, text: "Wrote 1,100 words. The chapter finally turned." },
  { id: "m11", occurredAt: "2026-10-22", domain: "soul", weight: 0.45, text: "Quiet walk, phone in a drawer. Felt like me again." },
  { id: "m12", occurredAt: "2026-10-27", domain: "mind", weight: 1, text: "Sent chapter one to the editor." },
];
// Every link names the words it rests on, so it can be checked and refused.
const LINKS = [
  { a: "m6", b: "m7", why: "Same day: you slept five hours, then were sharp with someone close that evening.", words: ["Slept five hours", "Snapped"] },
  { a: "m4", b: "m7", why: "Both are sharp moments with people close to you, on tired evenings.", words: ["Short with Sam", "Long day", "Snapped at my sister"] },
  { a: "m7", b: "m8", why: "The next day you followed the morning step “Call your sister. Just to talk.”", words: ["Called my sister"] },
  { a: "m1", b: "m2", why: "Mornings after time in the water, you wrote more.", words: ["cold water", "900 words"] },
  { a: "m9", b: "m10", why: "Again: back in the water, then your best writing day.", words: ["Back in the water", "1,100 words"] },
  { a: "m5", b: "m12", why: "The direction you wrote down, and the first real step toward it.", words: ["the book", "chapter one"] },
];

const tint = Object.fromEntries(worlds.map((w) => [w.key, w.tint]));
const name = Object.fromEntries(worlds.map((w) => [w.key, w.name]));
const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export function createConstellation({ onOpen, onClose } = {}) {
  let memories = SAMPLE.map((m) => ({ ...m }));
  let links = LINKS.map((l) => ({ ...l, rejected: false }));
  let showLinks = true, selected = null, undo = null, opener = null;

  const root = document.createElement("section");
  root.id = "moments";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "moments-title");
  root.inert = true;
  root.innerHTML = `
    <div class="mo-head">
      <div>
        <p class="mo-proto">Prototype · sample moments, not your data</p>
        <h2 id="moments-title" tabindex="-1">Your moments</h2>
        <p class="mo-sub">Each star is one evening you wrote or spoke. Brighter stars are moments an insight rests on.</p>
      </div>
      <button class="mo-close" type="button">Close</button>
    </div>
    <div class="mo-body">
      <svg class="mo-sky" viewBox="-500 -500 1000 1000" aria-hidden="true"></svg>
      <ol class="mo-list" aria-label="Moments, oldest first"></ol>
    </div>
    <div class="mo-card" aria-live="polite"></div>
    <div class="mo-foot">
      <label class="mo-switch"><input type="checkbox" checked> Show connections between moments</label>
      <button class="mo-view" type="button" aria-pressed="false">View as a list</button>
    </div>
    <p class="mo-toast" role="status"></p>`;
  document.getElementById("experience").appendChild(root);
  const $ = (sel) => root.querySelector(sel);
  const sky = $(".mo-sky"), list = $(".mo-list"), card = $(".mo-card"), toast = $(".mo-toast");

  // place stars on a slow spiral by date: oldest at the centre, newest outside
  const t0 = Date.parse(SAMPLE[0].occurredAt), t1 = Date.parse(SAMPLE[SAMPLE.length - 1].occurredAt);
  const pos = (m, i) => {
    const k = (Date.parse(m.occurredAt) - t0) / (t1 - t0 || 1);
    const ang = -1.4 + k * 5.2 + (i % 2 ? 0.18 : -0.12);
    const r = 90 + k * 330;
    return [Math.cos(ang) * r, Math.sin(ang) * r];
  };
  const P = Object.fromEntries(SAMPLE.map((m, i) => [m.id, pos(m, i)]));

  function draw() {
    const live = new Set(memories.map((m) => m.id));
    const ls = links.filter((l) => showLinks && !l.rejected && live.has(l.a) && live.has(l.b));
    sky.innerHTML = `
      <defs>${worlds.map((w) => `<radialGradient id="mo-g-${w.key}"><stop offset="0" stop-color="${w.tint}" stop-opacity=".95"/><stop offset=".35" stop-color="${w.tint}" stop-opacity=".25"/><stop offset="1" stop-color="${w.tint}" stop-opacity="0"/></radialGradient>`).join("")}</defs>
      ${ls.map((l) => `<line class="mo-link${selected && (l.a === selected || l.b === selected) ? " hi" : ""}" x1="${P[l.a][0]}" y1="${P[l.a][1]}" x2="${P[l.b][0]}" y2="${P[l.b][1]}"/>`).join("")}
      ${memories.map((m) => `<g class="mo-star${m.id === selected ? " sel" : ""}" transform="translate(${P[m.id][0]} ${P[m.id][1]})" data-id="${m.id}">
        <circle r="${18 + m.weight * 26}" fill="url(#mo-g-${m.domain})" opacity="${0.3 + m.weight * 0.5}"/>
        <circle r="${3 + m.weight * 4}" fill="${tint[m.domain]}"/></g>`).join("")}`;
    list.innerHTML = memories.map((m) => `<li><button type="button" data-id="${m.id}" aria-current="${m.id === selected}">
      <span class="d">${fmt(m.occurredAt)} · ${name[m.domain]}</span><span class="t">${m.text}</span></button></li>`).join("");
  }

  function show(id) {
    selected = id;
    const m = memories.find((x) => x.id === id);
    root.classList.toggle("has-card", !!m);
    if (!m) { card.innerHTML = ""; draw(); return; }
    const mine = links.filter((l) => showLinks && !l.rejected && (l.a === id || l.b === id) && memories.some((x) => x.id === (l.a === id ? l.b : l.a)));
    card.innerHTML = `
      <p class="mo-meta">${fmt(m.occurredAt)} · ${name[m.domain]}</p>
      <p class="mo-text">${m.text}</p>
      ${mine.length ? `<p class="mo-h">Why it is connected</p>` : showLinks ? `<p class="mo-none">Nothing is connected to this moment yet.</p>` : ""}
      ${mine.map((l) => {
        const other = memories.find((x) => x.id === (l.a === id ? l.b : l.a));
        return `<div class="mo-why"><p>${l.why}</p><p class="mo-basis">Based on your words: ${l.words.map((w) => `“${w}”`).join(", ")}</p>
          <p class="mo-other">With: ${fmt(other.occurredAt)}, “${other.text}”</p>
          <button type="button" class="mo-reject" data-a="${l.a}" data-b="${l.b}">That's not right</button></div>`;
      }).join("")}
      <button type="button" class="mo-remove" data-id="${m.id}">Remove this moment</button>`;
    draw();
  }

  function say(msg, undoFn) {
    undo = undoFn || null;
    toast.innerHTML = `${msg}${undoFn ? ' <button type="button" class="mo-undo">Undo</button>' : ""}`;
    toast.classList.add("on");
  }

  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-id], .mo-reject, .mo-undo, .mo-close, .mo-view");
    if (!t) return;
    if (t.classList.contains("mo-close")) return close();
    if (t.classList.contains("mo-view")) {
      const on = root.classList.toggle("as-list");
      t.setAttribute("aria-pressed", String(on)); t.textContent = on ? "View as a sky" : "View as a list";
      return;
    }
    if (t.classList.contains("mo-undo")) { if (undo) undo(); toast.classList.remove("on"); return; }
    if (t.classList.contains("mo-reject")) {
      const l = links.find((x) => x.a === t.dataset.a && x.b === t.dataset.b);
      l.rejected = true; show(selected);
      // the app's own words for a refused belief (app/world/[world].tsx)
      say("Thank you. I'll hold this loosely until your days say otherwise.", () => { l.rejected = false; show(selected); });
      return;
    }
    if (t.classList.contains("mo-remove")) {
      const id = t.dataset.id, before = memories;
      memories = memories.filter((m) => m.id !== id);
      show(null);
      say("Removed, with its connections.", () => { memories = before; show(id); });
      return;
    }
    if (t.dataset.id) show(t.dataset.id);
  });
  sky.addEventListener("click", (e) => { const g = e.target.closest(".mo-star"); if (g) show(g.dataset.id); });
  $(".mo-switch input").addEventListener("change", (e) => {
    showLinks = e.target.checked;
    show(selected);
    say(showLinks ? "Connections are on." : "Connections are off. Your moments are still here, in order.");
  });
  root.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });

  function open(from) {
    opener = from || document.activeElement;
    root.inert = false; root.classList.add("open");
    draw(); show(selected);
    onOpen && onOpen();
    setTimeout(() => $("#moments-title").focus({ preventScroll: true }), 60);
  }
  function close() {
    root.classList.remove("open"); root.inert = true; toast.classList.remove("on");
    onClose && onClose();
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }
  draw();
  return { open, close, get isOpen() { return root.classList.contains("open"); } };
}
