# Galaxy navigation specification

**Status:** proposal. It extends the Galaxy Home (`experience/home.html`, `src/home.js`, `src/home-scene.js`).

## Places and how they connect

```
Universe (Spirit)
 ├── Your Galaxy (realm of now) ── Mind · Body · Soul · Future ── a world's screen (today)
 │                                                     └── Future: Step forward → Future self
 └── Expedition Galaxy ── systems by world ── a system ── a mission (quest player)
```

**Tabs:** Home, Reflect, Explore, Memories, You (Explore is new, five in all).
- On phones they sit at the bottom; on wide screens, a rail.
- Reflect is always one tap away, from anywhere.

| From | To | Taps | Motion (normal) | Reduced motion |
|---|---|---|---|---|
| Anywhere | Write a reflection | 1 (Reflect) then type | Fade 240 ms | Instant |
| Home | A world | 1 | Camera arc 700 ms, then the painting fades in 600 ms | Instant |
| Anywhere | Explore | 1 | Camera pulls out to the Universe, then into the Expedition Galaxy (850 ms in all, interruptible) | A cross-fade |
| Explore | A mission's first step | 2 (mission, Begin) | Mission card rises 240 ms | Instant |
| A mission | Back to its system | 1 (back) or Escape | Reverse | Instant |
| Future world | Future self | 1 (Step forward) | Through the ring toward dawn, 850 ms, skippable | A cross-fade |
| Any level | Universe | Pinch out, or the Universe button | 850 ms | A cross-fade |

## The descent (first visit only, skippable)

Point of light → the Universe (two galaxies) → down into Your Galaxy → the realm of now (four worlds). 3 seconds; returning visitors never see it, and neither does reduced motion.

This replaces today's entrance. Same Skip button and the same "remembered" rule.

## Explore screen (works fully without 3D)

1. **Continue:** an open mission, with step and time left.
2. **Waiting to hear how it went:** experiments due a check-in.
3. **Suggested for you:** up to 3, each with its reason and source.
4. **All systems:** grouped by world, with missions as plain rows. Each row shows the objective and minutes, and a star once done.

In galaxy mode the same content floats over the Expedition Galaxy. In text view it's a list.

## Quest player

- **Header:** back, the mission name, step "2 of 6" (a position, not a score), and Exit (keeps your place).
- **Body:** one step at a time; the objective is always one tap away.
- **Choices:** large buttons (at least 44 px). After choosing, the explanation appears under it with a 240 ms rise, and focus moves to it.
- **Rehearse and reflect:** the same editor as Reflect, with drafts on the device and voice where the microphone is allowed.
- **Close:** what you practised, your action, and the discovery (skippable, 1.2 s).
- **Saves:** confirmed before the next step shows; never blocked by an animation.

## Rendering levels

| Level | Universe | Expedition Galaxy | System | Mission |
|---|---|---|---|---|
| High | 3D field, two galaxy sprites | Painted galaxy plus star buttons | Painted system art plus 3 planet buttons | 2D panels over the dimmed system |
| Standard | Same, no bloom, half dust | Same | Same | Same |
| Essential | Still image | Still image plus buttons | Still image plus buttons | 2D |

The same governor as today: if the median frame runs past 28 ms, glow, pixel ratio and dust drop. Every place also exists in text view.
