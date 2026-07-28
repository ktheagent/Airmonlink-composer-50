# Airmonlink Composer 3 — 1.2.4 Build 44 Checkpoint Notes

## Purpose

Build 44 is the lyrics and Tonic Sol-fa synchronization checkpoint. It does not claim
that Airmonlink Composer is a professional or final release.

## Functional changes

- Direct lyric entry advances semantically by space, hyphen and melisma.
- Multiple verses, chorus/refrain, elision and part visibility persist.
- Staff rendering displays all lyric verses with hyphens and extenders.
- Invalid multi-voice Sol-fa is rejected atomically without mutating the score.
- Staff and Sol-fa edits share pitch, timing, playback, reopen and export state.
- Sol-fa publication exposes pickups, repeats, tonic changes, chords and tuplets.
- Bracketed Sol-fa chord input creates one semantic staff chord.

## Status

Source, browser and viewport validation are required before this checkpoint is
frozen. No Windows Setup or Portable executable is claimed. Human Windows,
audio, MIDI, printer and device testing remain outstanding.
