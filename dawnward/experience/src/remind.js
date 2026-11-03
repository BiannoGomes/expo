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
export function icsFor({ action, at, url, uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@dawnward` }) {
  const end = new Date(at.getTime() + 30 * 60000);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dawnward//Remind me//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${stamp(at)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`Dawnward: ${action}`)}`,
    `DESCRIPTION:${esc(`The step you chose in Dawnward: ${action}\nAfterwards, open Dawnward and say how it went. Any answer counts.\n${url}`)}`,
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

/** A small sheet: choose a day and time, then save the calendar file. */
export function reminderSheet({ el, action, when, announce, returnFocus }) {
  const dlg = el("dialog", { class: "sheetdlg", "aria-labelledby": "rm-h" });
  const def = defaultMoment();
  const date = el("input", { id: "rm-date", class: "field", type: "date", value: def.date, required: true });
  const time = el("input", { id: "rm-time", class: "field", type: "time", value: def.time, required: true });
  const err = el("p", { class: "error", role: "alert" });
  const close = () => { dlg.close(); dlg.remove(); returnFocus?.focus?.(); };
  const save = () => {
    const at = new Date(`${date.value}T${time.value || "09:00"}`);
    if (!date.value || Number.isNaN(at.getTime())) { err.textContent = "Choose a day first."; date.focus(); return; }
    const url = `${location.origin}${location.pathname}#/home`;
    const blob = new Blob([icsFor({ action, at, url })], { type: "text/calendar;charset=utf-8" });
    const a = el("a", { href: URL.createObjectURL(blob), download: "dawnward-reminder.ics" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    close();
    announce?.("Calendar file saved. Open it to add the reminder to your calendar.");
  };
  dlg.append(
    el("h2", { id: "rm-h", class: "s-title" }, "Remind me"),
    el("p", { class: "statement" }, action),
    when ? el("p", { class: "quiet small" }, `You said: ${when}`) : null,
    el("label", { for: "rm-date", class: "label" }, "Day"), date,
    el("label", { for: "rm-time", class: "label" }, "Time"), time,
    err,
    el("div", { class: "actions" }, el("button", { class: "primary", onclick: save }, "Save to my calendar"), el("button", { class: "ghost", onclick: close }, "Cancel")),
    el("p", { class: "quiet small" }, "This makes a calendar file on your device. Nothing is sent anywhere; your calendar app keeps it."));
  dlg.addEventListener("close", () => dlg.remove());
  document.body.append(dlg);
  dlg.showModal();
  date.focus();
}
