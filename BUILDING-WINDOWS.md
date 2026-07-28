# Build Airmonlink Composer 1.1.11 Build 31 on Windows

## Prerequisites

- Windows 10 or Windows 11 x64
- Node.js 22
- Working access to the public npm registry
- PowerShell

## Validate and build

```powershell
npm ci
npm run validate:full
npm run dist:win
```

Expected outputs in `release/`:

```text
Airmonlink-Composer-1.1.11-Build31-Setup.exe
Airmonlink-Composer-1.1.11-Build31-Portable.exe
```

Generate SHA-256 checksums:

```powershell
Get-ChildItem release -File | ForEach-Object {
  $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower()
  "$hash  $($_.Name)"
}
```

A successful build is not proof of installation, upgrade, uninstall, printing,
audio, MIDI, signing, or physical-device behaviour. Complete those checks on
Windows before any final-release claim.
