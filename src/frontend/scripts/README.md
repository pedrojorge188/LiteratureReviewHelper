# Build Scripts

This directory contains helper scripts for building the Electron application.

## prepare-resources.js

This script prepares all necessary resources for building the Electron application:

### What it does:
1. **Copies the backend JAR** from `../backend/target/` to `resources/backend/backend.jar`
2. **Downloads JRE (Java Runtime Environment)** for each target platform:
   - Windows x64
   - Linux x64
3. **Extracts and organizes** the JRE files into `resources/jre-{platform}-{arch}/`

### Usage:

**Local development:**
```bash
cd ../backend
mvn clean package
cd ../frontend

npm run prepare-resources
```

**GitHub Actions:**
This script is automatically run during the CI/CD pipeline before building Electron executables.

### Requirements:
- Node.js 20+
- Backend JAR must be built first (`mvn clean package` in backend directory)
- Internet connection (to download JRE files ~50-100 MB per platform)

### Output structure:
```
resources/
├── backend/
│   └── backend.jar                    (~50 MB)
├── jre-win-x64/
│   ├── bin/
│   │   └── java.exe
│   └── lib/
│       └── ... (JRE libraries)
└── jre-linux-x64/
    ├── bin/
    │   └── java
    └── lib/
        └── ... (JRE libraries)
```

### Caching:
- Downloaded JRE files are kept in `temp-downloads/` to avoid re-downloading
- To force re-download: `npm run clean-resources && npm run prepare-resources`

### JRE Version:
Currently using **Eclipse Temurin 17.0.13+11** (Adoptium OpenJDK 17 LTS)

### Adding new platforms:
To add support for additional platforms (e.g., macOS), update the `JRE_URLS` object in `prepare-resources.js`:

```javascript
const JRE_URLS = {
  'win-x64': '...',
  'linux-x64': '...',
  'darwin-x64': 'https://github.com/adoptium/temurin17-binaries/releases/download/.../OpenJDK17U-jre_x64_mac_hotspot_17.0.13_11.tar.gz',
  'darwin-arm64': 'https://github.com/adoptium/temurin17-binaries/releases/download/.../OpenJDK17U-jre_aarch64_mac_hotspot_17.0.13_11.tar.gz',
};
```

Then update the platforms array in the `main()` function.
