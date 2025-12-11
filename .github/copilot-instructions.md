# GEDCOM Compare - AI Agent Instructions

## Project Overview

**GEDCOM Compare** is a React + TypeScript web app for side-by-side comparison of GEDCOM family tree files. It enables users to identify matching individuals across files, highlight differences, manually link matches, and persist comparison sessions to localStorage.

## Architecture & Key Decisions

### Three-Tier Logic Structure

1. **Parser** (`src/gedcomParser.ts`) - GEDCOM text → structured `GedcomPerson` objects
   - Minimal GEDCOM parsing (levels 0-2 only) to support core genealogy fields
   - Name split strategy: Parses "Given /Surname/" format per GEDCOM spec
   - String similarity matching uses Levenshtein distance (threshold: 0.8) + exact name+birthdate matching

2. **Comparison Engine** (`src/comparisonLogic.ts`) - Matching algorithm & session persistence
   - Auto-matching first pass on file load
   - Manual match creation overrides existing matches (prevents duplicates via filtering)
   - All state (matches, people) stored as immutable updates in ComparisonSession
   - Sessions serialized to localStorage under key `gedcom_sessions`

3. **React Components** (`src/components/`) - UI and synchronized interaction
   - PersonList (with ref forwarding) enables parent-controlled scroll synchronization
   - ComparisonView orchestrates all state and handles scroll binding via useEffect listeners
   - PersonDetail panel only renders when both left+right selected

### Critical Data Flow

```
Upload GEDCOM → parseGedcom() → GedcomPerson[]
                                      ↓
                        autoMatchPeople() → PersonMatch[]
                                      ↓
                    ComparisonView (state) ← User Actions
                                      ↓
                    Manual Match Updates → saveSession()
                                      ↓
                         localStorage
```

### Synchronized Scrolling Pattern

- Two independent `ref<HTMLDivElement>` on PersonLists capture scroll containers
- `useEffect` with dependency on `syncScroll` boolean adds/removes listeners
- Scroll event handler directly sets `scrollTop` on target ref (avoids re-render loop)
- Critical: cleanup listeners on unmount to prevent memory leaks

## Developer Workflows

### Build & Dev
```bash
npm install              # Install deps (React, Vite, Lucide, TypeScript)
npm run dev             # Start Vite dev server (port 5173, auto-open)
npm run build           # TypeScript compile + Vite minify → dist/
npm run preview         # Preview production build locally
```

### Code Patterns to Follow

- **Immutable Updates**: Never mutate `matches` array. Use `.filter()` to remove, spread array to add
- **Type Safety**: All data structures have interfaces; avoid implicit `any`
- **React Hooks**: Use `useState` for UI state, `useRef` for DOM access, `useEffect` for side effects
- **localStorage Format**: `JSON.stringify(ComparisonSession[])` - maintain structure for forward compatibility
- **Utility Naming**: Comparator functions start with `get...()` or `are...()` (e.g., `getPersonDisplayName()`, `arePeopleLikely()`)

## Key Files & Their Responsibilities

| File | Purpose | Key Exports |
|------|---------|------------|
| `gedcomParser.ts` | GEDCOM parsing + similarity logic | `parseGedcom()`, `GedcomPerson`, `arePeopleLikely()`, `getPersonDifferences()` |
| `comparisonLogic.ts` | Matching engine + session persistence | `createSession()`, `addMatch()`, `removeMatch()`, `saveSession()`, `getAllSessions()` |
| `App.tsx` | Main app router (Upload/Comparison/Sessions views) | View selection, file/session passing |
| `ComparisonView.tsx` | Comparison UI orchestrator | Scroll sync, state updates, detail panel |
| `PersonList.tsx` | Scrollable person list with match status indicators | Ref-forwarded for scroll control |
| `PersonDetail.tsx` | Expandable detail view for selected pair | Difference highlighting |
| `FileUploadView.tsx` | Dual file upload with basic validation | File reading & parsing |
| `SessionManager.tsx` | Load/delete saved comparison sessions | Session UI management |

## Testing Checklist for Changes

- **Parser**: Test with edge cases (missing dates, non-standard name formats, empty records)
- **Matching**: Verify string similarity threshold correctly identifies/excludes matches
- **Scroll Sync**: Manual test toggle on/off and verify both lists scroll together
- **Sessions**: Create → save → navigate away → load → verify all matches persist
- **UI**: Test responsive layout (resize to mobile width) and all control interactions

## Common Pitfalls & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Scroll listener fires multiple times | Missing cleanup in useEffect | Add return statement with removeEventListener |
| Matches disappear on manual creation | Mutating array instead of filtering | Use `.filter()` + spread to create new array |
| Session not saving | Serialize failure or wrong key | Check localStorage key matches `'gedcom_sessions'` |
| Large files hang UI | No pagination or virtualization | Consider adding windowing for 10k+ individuals |
| Imported React not used | ESM module jsx transform | Remove `import React` statements |

## Extending the App

### Adding a New Field to Comparison
1. Add field to `GedcomPerson` interface
2. Parse from GEDCOM in `parseGedcom()` (handle event dates/places)
3. Add comparison in `getPersonDifferences()`
4. Render in `PersonDetail.tsx` with `renderField()` helper

### Adding Session Metadata
1. Extend `ComparisonSession` interface
2. Populate in `createSession()` or when saving
3. Update `saveSession()` serialization (auto-handles via JSON.stringify)
4. Use in `SessionManager.tsx` display

## Performance Notes

- GEDCOM parsing is O(n) single pass (no re-parsing)
- String similarity matching is O(n×m) for two files → acceptable for <5k individuals per file
- localStorage limit ~5-10MB (typical sessions are <500KB)
- React renders optimized via PureComponent patterns in PersonList (manual React.memo if needed)

## Browser Support & Polyfills

Targets ES2020+; requires:
- `localStorage` API
- `File` API (for upload)
- `Promise` + async/await (for file reading)
- CSS Grid & Flexbox

No polyfills needed for target browsers (Chrome 90+, Firefox 78+, Safari 14+).
