# Dawnward films (Remotion)

Primary renderer for the Dawnward product films. Direction and evidence live in `docs/`:
`creative-direction.md` (strategy, three concepts with scores, flagship outline, proof shot cards),
`references.md` (benchmark analysis), `claims-ledger.md`, `asset-licensing.md`.

```sh
npm install                 # pinned versions; lockfile committed
npm run studio              # Remotion Studio for editing
npm run proof               # renders out/proof-9s-9x16.mp4
sh master.sh out/proof-9s-9x16.mp4 out/dawnward-proof-9s-9x16.mp4   # -14 LUFS / -1 dBTP master
```

Uses the container's Chromium (`remotion.config.ts`). Tokens: `src/theme.ts`. Assets: `public/`.
Nothing here is published or deployed without the owner's approval.
