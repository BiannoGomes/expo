# vendor/

Third-party code that compositions load from their own root (HyperFrames renders offline, so nothing comes from a CDN
at render time).

## gsap.min.js · GSAP 3.14.2 (core only, no plugins)

| | |
|---|---|
| Version | 3.14.2 (the file's own header: `GSAP 3.14.2 · @license Copyright 2025, GreenSock. All rights reserved. Subject to the terms at https://gsap.com/standard-license.`) |
| SHA-256 | `c174bfce53a729418d57a8ad8625e7247c793a22fef8e2851e3cfa3de9cd8280` |
| Provenance | Byte-identical to `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js` (re-downloaded and hashed 27.10.2026). Copied from the earlier reel build's vendor folder. |
| Licence | GSAP "Standard 'no charge' license" (npm `license` field for gsap@3.14.2: "Standard 'no charge' license: https://gsap.com/standard-license."). Free, commercial use included. The one prohibited use is building a no-code visual animation tool that competes with Webflow. The licence doesn't mention rendered video; nothing restricts it, but there is no explicit grant either (summary and sources in the creative-system audit, `references-licences.md` §2.2). |
| Rule | Keep the licence header intact. Don't edit the file. |

To check it:

```bash
sha256sum vendor/gsap.min.js   # expect c174bfce…cd8280
head -8 vendor/gsap.min.js     # the licence header
```

### Plugins

None are vendored and the runtime (`lib/becoming-motion.js`) needs none: the gold line draws with a plain
`strokeDashoffset` tween, and word reveals build their own spans. If a piece truly needs one (SplitText, DrawSVG,
MorphSVG, CustomEase…), vendor the **same version** next to this file from
`https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/<Plugin>.min.js`, keep its header, record its SHA-256 here, and load it
after `gsap.min.js`. HyperFrames lint reports `missing_gsap_plugin` if a plugin is used but not loaded.

Never tween `letterSpacing` (house rule, and a HyperFrames lint error).
