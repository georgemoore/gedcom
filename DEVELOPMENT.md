# GEDCOM Compare - Development Guide

## Project Overview

**GEDCOM Compare** is a web-based tool for side-by-side comparison of GEDCOM family tree files. It allows users to identify matching individuals, highlight differences, and manage comparison sessions.

## Architecture

### Core Components

- **`gedcomParser.ts`** - GEDCOM file parsing and individual data extraction
  - `parseGedcom()` - Main parser function
  - `GedcomPerson` interface - Individual record structure
  - Similarity matching with `arePeopleLikely()` and `getPersonDifferences()`

- **`comparisonLogic.ts`** - Matching algorithm and session persistence
  - Auto-matching based on name/birthdate similarity
  - Manual match management
  - localStorage-based session persistence
  - Session types: `ComparisonSession`, `PersonMatch`

### React Components

- **FileUploadView** - Dual file upload with GEDCOM parsing
- **ComparisonView** - Main comparison interface with synchronized scrolling
- **PersonList** - Scrollable list with match status indicators
- **PersonDetail** - Expandable detail view with difference highlighting
- **SessionManager** - Load/save/delete comparison sessions
- **SessionControls** - Save and reset actions

## Key Features

### Auto-Matching
- String similarity calculation using Levenshtein distance (threshold: 0.8)
- Exact name + birthdate matching
- Automatic detection on file load

### Synchronized Scrolling
- Both lists scroll in tandem by default
- Toggle-able via checkbox
- Implemented via scroll event listeners

### Manual Matching
- Toggle "Manual Matching Mode" to select and link specific individuals
- Create matches for missed pairs
- Break incorrect matches
- Manual matches override auto-detected ones

### Session Persistence
- All sessions stored in `localStorage` under key `gedcom_sessions`
- Session includes: files, people, and all matches (both auto and manual)
- Timestamps for audit trail
- Delete option for cleanup

### Difference Highlighting
- Compares: name, birth/death dates, places, sex
- Visual indicators (✓ matched, ⚠ differences, ⚠ unmatched)
- Detail panel shows specific mismatches side-by-side

## Workflow

1. **Upload** - Select two GEDCOM files
2. **Parse** - Extract individuals (minimal GEDCOM subset)
3. **Auto-Match** - Identify likely matches
4. **Review** - Synchronized scrolling inspection
5. **Refine** - Manual matching if needed
6. **Save** - Persist session to localStorage
7. **Load** - Reload previous sessions from SessionManager

## GEDCOM Parsing

### Supported Fields
- Name (with given/surname split)
- Birth date & place
- Death date & place  
- Sex
- Family references (FAMS, FAMC)
- Notes

### Limitations
- Minimal parsing (levels 0-2 only)
- Date parsing is basic (expects standard formats)
- No complex family structure reconstruction

## Styling

- **CSS Variables** - Color theme (primary, success, warning, danger)
- **Grid Layout** - Responsive 3-column comparison view
- **Color Codes**:
  - Blue (`--matched-bg`) - Matched with no differences
  - Yellow (`--different-bg`) - Matched with differences
  - Red (`--unmatched-bg`) - No match found

## Testing

Currently no automated tests. Manual testing checklist:
- [ ] GEDCOM file upload and parsing
- [ ] Auto-matching accuracy
- [ ] Synchronized scrolling
- [ ] Manual match creation/removal
- [ ] Session save/load/delete
- [ ] Responsive layout (mobile, tablet, desktop)

## Build & Deploy

```bash
npm install       # Install dependencies
npm run dev       # Dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 78+
- Safari 14+

## Known Issues & Future Enhancements

### Known Issues
- GEDCOM parsing is minimal (no complex family reconstruction)
- Date format variations not fully supported
- Large files (10k+ individuals) may have performance issues

### Potential Enhancements
- Advanced GEDCOM parsing (full standard support)
- Fuzzy matching with adjustable thresholds
- Duplicate merge functionality
- Export comparison results (PDF, CSV)
- Batch processing multiple file pairs
- Undo/redo for match changes
- Performance optimization for large files

## Code Patterns

### Type Safety
- Full TypeScript with strict mode
- Interfaces for all data structures
- No implicit `any` types

### State Management
- React hooks (useState, useRef, useEffect)
- localStorage for persistence
- Immutable updates for matches/sessions

### Event Handling
- Controlled inputs and checkboxes
- Event delegation for list items
- Clean event listener cleanup in useEffect

## Developer Notes

- Avoid modifying file parsing logic without comprehensive testing
- Session format is JSON - maintain backward compatibility when evolving
- Keep localStorage under ~5MB (session limits)
- Test with real GEDCOM files to understand format variations
