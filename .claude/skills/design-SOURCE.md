# Vendored design skills (installed 2026-11-02)

Installed into Dawnward on 2026-11-02 from the vetted list in Bianno's Jarvis repo (`BiannoGomes/jarvis` `jarvis/design-skills/manifest.json`, read and scanned 13-14 Oct 2026), each source checked out at the commit below. Registry: `design-manifest.json`. Only text was copied: no hooks, no settings, no vendor script was run. Re-scanned 2 Nov: the 7 bundled scripts (figma-suite 1, taste 1, ui-ux-pro-max 5) make no network calls and read no secrets.

**Not reinstalled:** `impeccable`, because Dawnward already has a newer one (4.7.1; the list pins 4.5.2).
**Not here:** 21st.dev and GetLayers (no access verified; `design-reference` covers using them as references), and the Canva, Figma and Adobe connectors (they're claude.ai connectors, not skills). **auto** = Claude may load it by itself; **manual** = type `/name` to use it.

| Skill | Source@commit | Licence | Mode | Why / patches |
|---|---|---|---|---|
| taste | senlindesign/taste-skill@6dce223 | MIT (README badge; no LICENSE file in repo) | auto | extracts design DNA + reasoning from a reference URL; needs Playwright MCP |
| emil-design-eng | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| animate | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| review-animations | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| improve-animations | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| find-animation-opportunities | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| animation-performance | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| animation-vocabulary | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| apple-design | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| break-ui | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| prototype | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| pick-ui-library | emilkowalski/skills@2d22863 | MIT | manual | motion craft (Emil Kowalski) |
| design-taste | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| brutalist-industrial | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| cinematic-motion | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| corporate-trust | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| dark-tech | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| editorial-minimal | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| japanese-minimal | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| neo-brutalism | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| playful-color | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| quiet-luxury | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| retro-print | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-accessibility | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-brand-identity | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-code-craft | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-code-review | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-color | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-design-review | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-design-system | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-gsap | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-landing-page | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-motion | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-typography | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-ux-copy | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| taste-web-performance | madebymustafa/design-taste@c4a6bff | MIT | manual | design genres + craft lenses |
| ui-ux-pro-max | nextlevelbuilder/ui-ux-pro-max-skill@7246805 | MIT | manual | design-system search over local CSV data (python, offline); paid logo/icon generators NOT installed |
| extract-design | Manavarya09/design-extract@23b6c1b | MIT | manual | website → design-system files via the designlang CLI (pinned) |
| mobile-app-ui-design | ceorkm/mobile-app-ui-design@4c67a0e | MIT (README badge; no LICENSE file in repo) | manual | touch-first app screens |
| figma-suite | robukh/figma-suite@79c4ea6 | MPL-2.0 | manual | Figma tokens/libraries/audits through the official Figma MCP |
| design-review | Bbasche/design-review@b734051 | MIT | manual | independent screenshot-based design critique |
| vercel-react-best-practices | vercel-labs/agent-skills@063bee9 | MIT | manual | React engineering practice |
| vercel-composition-patterns | vercel-labs/agent-skills@063bee9 | MIT | manual | React engineering practice |
| vercel-react-view-transitions | vercel-labs/agent-skills@063bee9 | MIT | manual | React engineering practice |
| web-design-guidelines | vercel-labs/agent-skills@063bee9 | MIT | manual | Vercel guideline review; remote rules replaced by a pinned local copy |
| writing-guidelines | vercel-labs/agent-skills@063bee9 | MIT | manual | Vercel guideline review; remote rules replaced by a pinned local copy |
| chrome-devtools | ChromeDevTools/chrome-devtools-mcp@c34bbe6 | Apache-2.0 | manual | browser debugging via Chrome DevTools MCP (pinned in .mcp.json) |
| a11y-debugging | ChromeDevTools/chrome-devtools-mcp@c34bbe6 | Apache-2.0 | manual | browser debugging via Chrome DevTools MCP (pinned in .mcp.json) |
| debug-optimize-lcp | ChromeDevTools/chrome-devtools-mcp@c34bbe6 | Apache-2.0 | manual | browser debugging via Chrome DevTools MCP (pinned in .mcp.json) |
| apple-hig | ebuntario/apple-hig@c434b91 | MIT | manual | Apple HIG as rules (foundations, components, patterns); setup + bin/uninstall scripts left out; broad 'Dark Mode/Apple design' triggers would fight apple-design, so manual |
