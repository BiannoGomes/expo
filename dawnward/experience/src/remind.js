// "Remind me": a calendar file for a planned action, made on this device and saved by the person.
// No server, no account, no notification permission: the file goes to their own calendar app,
// and the event links back to Dawnward, where "How did it go?" is waiting.
// (Why: without accounts or notifications, nothing else can bring someone back on the day.)

const pad = (n) => String(n).padStart(2, "0");
/** A local date/time as an iCalendar "floating" time: it means the same clock time wherever they are. */
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const utc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** Text values escaped as RFC 5545 requires. */
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** Lines longer than 75 octets are folded (RFC 5545 §3.1). */
function fold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out = []; let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > (out.length ? 74 : 75)) { out.push(cur); cur = ""; }
    cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

/** The .ics text for one action at one moment (30 minutes long, with an alert at the start). */
export function icsFor({ action, at, url, weekly = false, uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@dawnward` }) {
  const end = new Date(at.getTime() + 30 * 60000);
  const desc = weekly
    ? `Your week in Dawnward: what you wrote, the steps you chose and how they went.\nIt takes a few minutes. Skip it any week; nothing is lost.\n${url}`
    : `The step you chose in Dawnward: ${action}\nAfterwards, open Dawnward and say how it went. Any answer counts.\n${url}`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dawnward//Remind me//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${stamp(at)}`, `DTEND:${stamp(end)}`,
    ...(weekly ? ["RRULE:FREQ=WEEKLY"] : []),
    `SUMMARY:${esc(`Dawnward: ${action}`)}`,
    `DESCRIPTION:${esc(desc)}`,
    `URL:${url}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(`Dawnward: ${action}`)}`, "TRIGGER:PT0M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].map(fold).join("\r\n") + "\r\n";
}

/** Tomorrow at 09:00, as the values a date and a time input expect. */
export function defaultMoment(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: "09:00" };
}

/** The next given weekday (0 = Sunday) at 18:00, as date and time input values; today counts if it's still ahead. */
export function nextWeekday(day = 0, now = new Date(), time = "18:00") {
  const [hh, mm] = time.split(":").map(Number);
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
  while (d.getDay() !== day || d <= now) d.setDate(d.getDate() + 1);
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time };
}

/** A small sheet: choose a day and time, then save the calendar file. Weekly: a repeating "Your week" reminder. */
export function reminderSheet({ el, action, when, announce, returnFocus, mark, weekly = false }) {
  const dlg = el("dialog", { class: "sheetdlg", "aria-labelledby": "rm-h" });
  const def = weekly ? nextWeekday(0) : defaultMoment();
  const date = el("input", { id: "rm-date", class: "field", type: "date", value: def.date, required: true });
  const time = el("input", { id: "rm-time", class: "field", type: "time", value: def.time, required: true });
  const err = el("p", { class: "error", role: "alert" });
  const close = () => { dlg.close(); dlg.remove(); returnFocus?.focus?.(); };
  const save = () => {
    const at = new Date(`${date.value}T${time.value || "09:00"}`);
    if (!date.value || Number.isNaN(at.getTime())) { err.textContent = "Choose a day first."; date.focus(); return; }
    const url = `${location.origin}${location.pathname}#/${weekly ? "journey/week" : "home"}`;
    const blob = new Blob([icsFor({ action, at, url, weekly })], { type: "text/calendar;charset=utf-8" });
    const a = el("a", { href: URL.createObjectURL(blob), download: weekly ? "dawnward-your-week.ics" : "dawnward-reminder.ics" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    close();
    announce?.("Calendar file saved. Open it to add the reminder to your calendar.");
  };
  // append() prints null as the word "null", so only real nodes go in
  dlg.append(...[
    mark ? el("img", { class: "rm-mark", src: mark, alt: "" }) : null,
    el("h2", { id: "rm-h", class: "s-title", tabindex: "-1" }, weekly ? "Your week, every week" : "Remind me"),
    el("p", { class: "quiet small" }, weekly ? "A few quiet minutes once a week to look back. Choose the first one; it repeats on that day and time." : "Choose when you'd like a gentle reminder."),
    weekly ? null : el("p", { class: "statement" }, action),
    when ? el("p", { class: "quiet small" }, `You said: ${when}`) : null,
    el("div", { class: "rm-row" }, el("span", { class: "rm-i", html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>' }), el("label", { for: "rm-date" }, weekly ? "Starting" : "Day"), date),
    el("div", { class: "rm-row" }, el("span", { class: "rm-i", html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>' }), el("label", { for: "rm-time" }, "Time"), time),
    err,
    el("div", { class: "actions" }, el("button", { class: "primary", onclick: save }, "Save to my calendar"), el("button", { class: "ghost", onclick: close }, "Cancel")),
    el("p", { class: "quiet small" }, `This makes a calendar file on your device. Nothing is sent anywhere; your calendar app keeps it${weekly ? ", and you can stop it there any time" : ""}.`)].filter(Boolean));
  dlg.addEventListener("close", () => dlg.remove());
  document.body.append(dlg);
  dlg.showModal();
  // focus the title, not the date: on a phone, focusing a date field can pop its picker open before the sheet is read
  dlg.querySelector("#rm-h").focus();
}
