# CaseBoard Brand Style Guide

## Direction

CaseBoard uses a cold forensic investigation mood rather than a warm crime-board palette. The product should feel like a serious graph editor for project evidence, not a horror game, police app, or premium gold brand.

## Logo Assets

- Primary PNG reference: `public/brand/caseboard-logo-horizontal-v3-cold.png`
- Flat header logo: `public/brand/caseboard-logo-flat.svg`
- Flat symbol: `public/brand/caseboard-symbol-flat.svg`
- Favicon: `public/favicon.svg`
- Brand tokens: `public/brand/caseboard-tokens.css`

## Color Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `--cb-bg` | `#0f1110` | App background |
| `--cb-bg-soft` | `#141817` | Secondary background |
| `--cb-panel` | `#181d1b` | Sidebar and editor panels |
| `--cb-card` | `#222824` | Node cards and compact surfaces |
| `--cb-border` | `#3f4844` | Quiet borders |
| `--cb-text` | `#d8d6cf` | Primary text |
| `--cb-muted` | `#8d9491` | Secondary text |
| `--cb-teal` | `#5f858c` | Primary action and graph links |
| `--cb-burgundy` | `#8f3f46` | Evidence highlight |
| `--cb-danger` | `#b64b45` | Delete, bug, destructive states |

Avoid yellow, gold, beige, sand, tan, orange, and warm cream as dominant colors.

## Node Type Colors

| Node Type | Color | Meaning |
| --- | --- | --- |
| Task | `#5f858c` | Work item or planned action |
| Bug | `#b64b45` | Defect, blocker, or incident |
| Person | `#7d6f96` | Member, owner, stakeholder |
| Event | `#71806f` | Deadline, meeting, milestone |

## UI Tone

- Board list: `Case Archive`
- Board detail: `Case File`
- Node: `Clue Card`
- Edge: `Evidence Link`
- My page: `Investigator Profile`
- Empty board copy: `No clues have been recorded yet.`
- Auto layout action: `Reorder Evidence`
- Relationship recommendation: `Suspicious Link`
- Focus mode: `Focused Investigation`

## Component Rules

- Keep cards compact with an 8px radius or less.
- Use flat surfaces with subtle borders instead of decorative glow.
- Use teal for primary actions, burgundy or red only for evidence emphasis and danger.
- Use node colors as left borders, status chips, or small labels rather than full-card fills.
- In the graph editor, let the canvas feel spacious and dark; reserve panels for editing controls and analysis.

## Typography

- App UI: `Inter`, `Pretendard`, or the system sans-serif stack.
- Logo wordmark: heavy sans-serif, no negative letter spacing.
- Labels and metadata: uppercase can be used sparingly for case-file flavor.

## Implementation Notes

Use `next/image` for PNG brand references in landing/report-like areas. Use SVG assets for navigation headers, sidebars, app icons, and favicon metadata.
