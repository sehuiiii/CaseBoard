# CaseBoard Implementation Spec

## Concept

CaseBoard treats each project as a case file. Tasks, bugs, people, and events become clue cards on a graph editor. Links between cards represent evidence relationships that help the user understand project flow and risk.

## Implemented Scope

- Public landing page
- Auth.js email/password signup and login
- Auth.js Credentials Provider with JWT session strategy
- Prisma Adapter compatible auth tables
- Protected pages for case files, editor, and profile
- Board creation, search, listing, and deletion
- React Flow graph editor
- Node creation, editing, deletion, dragging, and position persistence
- Edge creation and deletion
- Automated graph analysis
- Relationship-based auto layout with Dagre
- Suspicious link suggestions from title/content matching
- Focus mode for selected node neighborhoods
- Korean/English i18n with separated JSON files
- Loading, error, not-found, favicon, Open Graph, sitemap, robots

## Pages

| Route | Purpose | Auth |
| --- | --- | --- |
| `/[locale]` | Landing page | Public |
| `/[locale]/login` | Login | Public |
| `/[locale]/signup` | Signup | Public |
| `/[locale]/boards` | Case archive and board CRUD | Protected |
| `/[locale]/boards/[id]` | Graph editor | Protected |
| `/[locale]/mypage` | Investigator profile and statistics | Protected |

## Data Model

- `User`: investigator account
- `Account`: Auth.js provider account table
- `Session`: Auth.js adapter session table, kept for adapter compatibility
- `VerificationToken`: Auth.js verification token table
- `Board`: user-owned case file
- `CaseNode`: clue card with type, title, content, and canvas position
- `CaseEdge`: evidence link between two nodes

## Graph Editor Features

| Feature | Description |
| --- | --- |
| Node CRUD | Add, edit, and delete Task/Bug/Person/Event nodes |
| Edge CRUD | Connect nodes with React Flow handles and delete selected links |
| Drag persistence | Stores node `x` and `y` through a Route Handler |
| Auto layout | Uses Dagre to reorder evidence relationships left-to-right |
| Analysis panel | Counts total nodes, links, isolated clues, and critical clues |
| Isolated clue detection | Nodes with no edge are flagged |
| Critical clue detection | Nodes with three or more links are flagged |
| Suspicious links | Suggests links when one node mentions another node title |
| Focus mode | Highlights the selected node and directly connected neighbors |

## Assignment Mapping

| Requirement | Implementation |
| --- | --- |
| Next.js 16 App Router | `src/app` route tree with `next@16.2.6` |
| TypeScript | Strict TypeScript project |
| i18n | `messages/ko.json`, `messages/en.json`, locale route segment |
| DB writes | Board/node/edge create, update, delete, and position save |
| Authentication | Auth.js Credentials Provider + Prisma Adapter |
| Protected area | Protected layout calls `requireUser`, which reads Auth.js `auth()` |
| Server logic | Server Actions and Route Handler |
| 3+ screens | Landing, boards, editor, mypage |
| Loading/error/not-found | App Router special files |
| Image optimization | `next/image` renders brand PNG/SVG assets |
| Metadata | title, description, favicon, OG, sitemap, robots |

## Brand Direction

The selected identity is the v3 cold forensic palette: charcoal, cool white, forensic teal, green-gray, burgundy, and danger red. Yellow, gold, beige, and warm cream should not be dominant UI colors.
