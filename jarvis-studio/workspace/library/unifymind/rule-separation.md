# Rule separation (UnifyMind)

**What:** the brand's gold rule (5 px, `#E0A83E`) draws itself under the current text block, then
**lifts away together with it** as the last target of the block's exit. It reads as "a line drawn under
the old idea, and both leave together". It happens at the focal point, so it never reads as a progress bar.

**From:** `projects/2026-09-30-unifymind-two-versions` (v4 → v6, see review/log.md).
**Rejected variant:** a rule that "passes through" (its left end chasing the right) read as a loader
spinner in the fresh-eyes critique, and pulled the eye away from the incoming text. Don't use it.

```js
// #rule: position absolute, left 96px, top <block bottom + ~40px>, width 844px, height 5px, background #E0A83E
tl.fromTo("#rule", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, T);
const oldIdea = [...document.querySelectorAll("#old .line"), document.querySelector("#rule")];
tl.to(oldIdea, { opacity: 0, y: -16, duration: 0.3, ease: "power3.inOut", stagger: 0.03 }, T + 0.35);
tl.fromTo("#new .line", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", stagger: 0.11 }, T + 0.64); // overlap: no empty frame
```

**Open question for Bianno:** the header's 95×5 bar and this rule are on screen together for about 0.6 s.
MOTION.md field 22 says "the one rule". Is a second instance allowed?
**Don't:** use it more than once per piece, or anywhere except a real change of idea.
