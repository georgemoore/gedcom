# GEDCOM Compare

A powerful web-based tool for side-by-side comparison of GEDCOM family tree files.

## Features

✨ **Side-by-side Comparison** - Upload two GEDCOM files and view individuals from each file side-by-side

🔍 **Intelligent Matching** - Automatic detection of matching individuals based on name and date of birth similarity

🎯 **Difference Highlighting** - Visual indicators and detailed comparison of differences between matched records

🔗 **Manual Matching** - Easily create or break matches that the automatic system missed or incorrectly identified

🔄 **Synchronized Scrolling** - Both lists scroll together for easy comparison (toggle on/off)

💾 **Session Persistence** - Save, load, and manage comparison sessions with full match history

## Getting Started

### Installation

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5173`

### Usage

1. **Upload Files** - Select two GEDCOM files from your device
2. **Auto-Match** - The app automatically identifies likely matches
3. **Review** - Scroll through individuals, compare side-by-side
4. **Manual Matching** - Toggle "Manual Matching Mode" to create/break matches
5. **Save** - Save your comparison work for later
6. **Load** - Return to previous comparisons anytime

## File Format

Accepts standard GEDCOM files (`.ged` or `.txt`). The parser supports:

- Individual records (INDI)
- Names (with given/surname split)
- Birth and death events with dates and places
- Sex information
- Notes

## Technical Details

- **Framework**: React 18 + TypeScript
- **Styling**: CSS with CSS Variables
- **Build Tool**: Vite
- **Storage**: Browser localStorage (all data stored locally)
- **Parsing**: Custom GEDCOM parser supporting standard format

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for architecture, patterns, and contribution guidelines.

### Build for Production

```bash
npm run build      # Creates optimized dist/ directory
npm run preview    # Preview production build locally
```

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 78+
- Safari 14+

## License

MIT

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with description
