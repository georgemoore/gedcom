# Quick Start Guide

## Setup & Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will automatically open at `http://localhost:5173`

## Testing the App

### Using Sample Files

Two sample GEDCOM files are included in the repository:
- `sample1.ged` - Family tree with 4 members
- `sample2.ged` - Similar family tree with slight variations and 1 different person

**Try This:**
1. Click "Upload Files"
2. Select `sample1.ged` as the first file
3. Select `sample2.ged` as the second file
4. Click "Compare Files"

You should see:
- John/Jon Smith will likely auto-match (similar names, same birth date range)
- Mary Johnson matches perfectly
- Robert Smith matches
- Susan Smith appears only in sample1 (unmatched - red)
- Elizabeth Smith appears only in sample2 (unmatched - red)

### Try Manual Matching

1. Enable "Manual Matching Mode"
2. Click on an unmatched person in the left list
3. Click on an unmatched person in the right list
4. Click "Create Match" button
5. The match appears between the two columns

### Test Synchronized Scrolling

1. Toggle "Sync Scrolling" off
2. Scroll one list independently
3. Toggle "Sync Scrolling" on
4. Scroll one list - both scroll together

### Save & Load Sessions

1. After making changes, click "Save Session"
2. Go to "Sessions" tab
3. You should see your saved session with timestamps
4. Click "Load" to restore it
5. Click "Delete" to remove it

## For Development

### Build Production Version

```bash
npm run build
npm run preview
```

### Code Structure

- **`src/gedcomParser.ts`** - GEDCOM parsing logic
- **`src/comparisonLogic.ts`** - Matching algorithm and state management
- **`src/components/`** - React UI components
- **`src/index.css`** - All styling

### Key Features to Explore

- **Auto-matching** - Detects similarities based on name (Levenshtein distance) and birth date
- **Difference highlighting** - Shows specific field mismatches in detail panel
- **Status indicators** - Color codes: blue=matched, yellow=matched with differences, red=unmatched
- **Session persistence** - All data stored in browser's localStorage

## Troubleshooting

### Files won't upload
- Ensure files have `.ged` or `.txt` extension
- Check that GEDCOM file is valid (starts with `0 HEAD`)

### Session data disappears
- Check browser's localStorage settings
- Clear browser cache can reset stored sessions

### Sync scrolling not working
- Make sure "Sync Scrolling" checkbox is enabled
- Check browser console for any JavaScript errors

## Next Steps

- Read [README.md](README.md) for feature overview
- Read [DEVELOPMENT.md](DEVELOPMENT.md) for architecture details
- Check [.github/copilot-instructions.md](.github/copilot-instructions.md) for AI agent guidance
