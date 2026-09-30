# Cut on arriving content (shared)

**Problem:** a hard cut into a scene whose elements animate *in* lands on an empty frame, because the new
scene is invisible at the cut.

**Fix:** start the incoming scene's entrance about 100 ms *before* the cut, inside a container held at opacity 0,
then switch the container on at the exact cut frame. The cut lands on content that's already arriving.

```js
tl.fromTo("#next", { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);                 // hold hidden
tl.fromTo("#next .item", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" }, CUT - 0.1);
tl.set("#prev", { opacity: 0 }, CUT);
tl.set("#next", { opacity: 1 }, CUT);
```

**From:** `projects/2026-09-30-unifymind-two-versions` (v3). Verified at 6.333 s in `review/v3`.
