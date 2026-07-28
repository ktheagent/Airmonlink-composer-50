# Airmonlink Composer 3 — Version 1.2.4 Build 44

> **Status:** Source-validated lyrics and Tonic Sol-fa synchronization checkpoint. Not a professional release.  
> **GitHub embargo:** ACTIVE.

## Build 44 purpose

Build 44 continues the functional reconstruction from Build 43. It connects lyrics,
all four Tonic Sol-fa voices and Staff notation to the same authoritative events.

The essential rhythm workflow is:

```text
Edit Staff or Tonic Sol-fa → update the same score event → render lyrics/Sol-fa
→ undo/redo → save/reopen → playback/export the same notation
```

Implemented and regression-protected:

- rapid note-attached lyric entry with multiple verses and navigation;
- semantic hyphens, melisma extenders, elision and chorus/refrain lines;
- lyric part visibility, positioning, copy, delete and search/replace;
- all rendered lyric verses with independent baselines;
- atomic Tonic Sol-fa passage validation for all four voices;
- bidirectional Staff/Sol-fa pitch editing;
- exact comma, dot, dash, underscore and barline interpretation;
- pickups, repeats, tonic changes, chords and tuplets in Sol-fa publication;
- bracketed Sol-fa chord input creating semantic staff chords;
- `.airscore`, playback and MusicXML synchronization.

Controls without sufficient end-to-end evidence remain hidden by the functional
command registry.

## Local validation

Run:

```bash
npm run lint
npm test
npm run performance
npm run preview
npm run browser-smoke
npm run viewport-matrix
```

## Windows packaging target

```bash
npm ci
npm run dist:win
```

Expected Windows filenames after a successful Windows build:

```text
Airmonlink-Composer-1.2.4-Build44-Setup.exe
Airmonlink-Composer-1.2.4-Build44-Portable.exe
```

No Build 44 Windows executable has been produced or tested while the GitHub
embargo is active. Installation, startup, audio, MIDI, printing, signing and
human Windows usability remain unverified.

## Development records

- `docs/BUILD44-LYRICS-SOLFA-SYNCHRONIZATION.md`
- `docs/BUILD44-VERIFICATION.md`
- `docs/CONTROL-ENGINE-TRACEABILITY.csv`
- `docs/development/PROJECT-STATUS.md`
