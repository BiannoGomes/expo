# Rule separation (UnifyMind)

**What:** the brand's gold rule (5 px, `#E0A83E`) draws itself under the current text block, the text
lifts away, then the rule passes through and leaves, its left end chasing the right. It reads as "a line
drawn between two ideas". It happens at the focal point, so it never reads as a progress bar.

**From:** `projects/2026-09-30-unifymind-two-versions` (v4, review/log.md).

```js
// #rule: position absolute, left 96px, top <block bottom + ~40px>, width 844px, height 5px, background #E0A83E
tl.fromTo("#rule", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, T);
tl.to(".old .line", { opacity: 0, y: -16, duration: 0.3, ease: "power3.inOut", stagger: 0.03 }, T + 0.15);
tl.set("#rule", { transformOrigin: "100% 50%" }, T + 0.4);
tl.to("#rule", { scaleX: 0, duration: 0.35, ease: "power3.inOut" }, T + 0.4);
tl.fromTo(".new .line", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out", stagger: 0.11 }, T + 0.55);
```

**Don't:** use it more than once per piece, or anywhere except a real change of idea.
