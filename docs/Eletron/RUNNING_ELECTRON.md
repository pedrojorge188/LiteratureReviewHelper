# Running the Electron Desktop App

## Prerequisites

- Node.js 20+
- Backend JAR built at `src/backend/target/literature-review-helper-0.0.1-SNAPSHOT.jar`

## Development Commands

### Run Electron with Backend (Recommended)

```bash
cd src/frontend
npm run electron:dev
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Launch Electron window with DevTools
- Run the backend automatically

### Run Components Separately

**Terminal 1 - Vite dev server:**
```bash
cd src/frontend
npm run dev
```

**Terminal 2 - Electron:**
```bash
cd src/frontend
npm run electron
```

## Building for Production

### Full Build (All Platforms)

```bash
cd src/frontend
npm run build              # Build React app
npm run prepare-resources  # Download JRE + copy backend JAR
npm run electron:build     # Build Windows + Linux executables
```

### Build Specific Platform

**Windows only:**
```bash
npm run electron:build:win
```

**Linux only:**
```bash
npm run electron:build:linux
```

### Output

Built apps are in `src/frontend/dist-electron/`:
- `Literature Review Helper-{version}-Windows-x64.exe` (Installer)
- `Literature Review Helper-{version}-Windows-x64-Portable.exe` (Portable)
- `Literature Review Helper-{version}-Linux-x64.AppImage`
- `Literature Review Helper-{version}-Linux-x64.deb`

## Backend Updates

**Important:** When updating backend code, test in the browser first:

1. Build backend:
   ```bash
   cd src/backend
   mvn clean package
   ```

2. Test in browser (faster iteration):
   ```bash
   cd src/frontend
   npm run dev
   ```
   Visit `http://localhost:5173`

3. Once working, test in Electron:
   ```bash
   npm run electron:dev
   ```

This approach is faster since building the backend JAR takes time, and browser testing gives you the same React experience.

## Logs

- **Development**: `src/frontend/logs/main.log`
- **Production (Windows)**: `%APPDATA%\Literature Review Helper\logs\main.log`
- **Production (Linux)**: `~/.config/Literature Review Helper/logs/main.log`

## Clean Build

```bash
cd src/frontend
npm run clean-resources  # Remove downloaded JREs
rm -rf dist dist-electron node_modules
npm install
```
