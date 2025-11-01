const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const tar = require('tar');
const AdmZip = require('adm-zip');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');
const BACKEND_JAR_SOURCE = path.join(__dirname, '..', '..', 'backend', 'target', 'literature-review-helper-0.0.1-SNAPSHOT.jar');
const BACKEND_JAR_DEST = path.join(RESOURCES_DIR, 'backend', 'backend.jar');


const JRE_URLS = {
  'win-x64': 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jre_x64_windows_hotspot_17.0.13_11.zip',
  'linux-x64': 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jre_x64_linux_hotspot_17.0.13_11.tar.gz',
};

/**
 * Download a file from a URL with redirect support
 */
async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading: ${url}`);
    const file = fs.createWriteStream(destPath);
    
    const download = (downloadUrl, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      https.get(downloadUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          console.log(`   Redirecting to: ${response.headers.location}`);
          download(response.headers.location, redirectCount + 1);
        } else if (response.statusCode === 200) {
          const totalBytes = parseInt(response.headers['content-length'], 10);
          let downloadedBytes = 0;
          
          response.on('data', (chunk) => {
            downloadedBytes += chunk.length;
            const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
            process.stdout.write(`\r   Progress: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(1)} MB / ${(totalBytes / 1024 / 1024).toFixed(1)} MB)`);
          });

          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`\nDownloaded: ${path.basename(destPath)}`);
            resolve();
          });
        } else {
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        }
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    download(url);
  });
}

/**
 * Extract a ZIP file
 */
async function extractZip(zipPath, destDir) {
  console.log(`📦 Extracting ZIP: ${path.basename(zipPath)}`);
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
  console.log(`✅ Extracted to: ${destDir}`);
}

/**
 * Extract a TAR.GZ file
 */
async function extractTarGz(tarPath, destDir) {
  console.log(`📦 Extracting TAR.GZ: ${path.basename(tarPath)}`);
  await tar.x({
    file: tarPath,
    cwd: destDir,
  });
  console.log(`✅ Extracted to: ${destDir}`);
}

/**
 * Prepare JRE for a specific platform
 */
async function prepareJRE(platform, arch) {
  const platformKey = `${platform}-${arch}`;
  const url = JRE_URLS[platformKey];
  
  if (!url) {
    console.warn(`No JRE URL configured for ${platformKey}, skipping...`);
    return;
  }

  const jreDir = path.join(RESOURCES_DIR, `jre-${platform}-${arch}`);
  const downloadDir = path.join(__dirname, '..', 'temp-downloads');
  const fileName = path.basename(url.split('?')[0]);
  const downloadPath = path.join(downloadDir, fileName);

  if (fs.existsSync(jreDir)) {
    console.log(`JRE for ${platformKey} already exists, skipping download`);
    return;
  }

  console.log(`\nPreparing JRE for ${platformKey}...`);

  await fs.ensureDir(downloadDir);
  await fs.ensureDir(jreDir);

  try {

    if (!fs.existsSync(downloadPath)) {
      await downloadFile(url, downloadPath);
    } else {
      console.log(`Using cached download: ${fileName}`);
    }

    if (fileName.endsWith('.zip')) {
      await extractZip(downloadPath, jreDir);
    } else if (fileName.endsWith('.tar.gz')) {
      await extractTarGz(downloadPath, jreDir);
    }

    const extractedContents = await fs.readdir(jreDir);
    if (extractedContents.length === 1) {
      const extractedFolder = path.join(jreDir, extractedContents[0]);
      const stat = await fs.stat(extractedFolder);
      
      if (stat.isDirectory()) {
        console.log(`🔄 Moving contents from nested folder to root...`);
        const tempDir = path.join(RESOURCES_DIR, 'temp-jre-move');
        await fs.move(extractedFolder, tempDir);
        await fs.remove(jreDir);
        await fs.move(tempDir, jreDir);
      }
    }

    // Verify JRE structure
    const javaExecutable = platform === 'win' 
      ? path.join(jreDir, 'bin', 'java.exe')
      : path.join(jreDir, 'bin', 'java');

    if (!fs.existsSync(javaExecutable)) {
      throw new Error(`Java executable not found at expected location: ${javaExecutable}`);
    }

    console.log(`JRE for ${platformKey} prepared successfully`);
    console.log(`   Location: ${jreDir}`);
    console.log(`   Executable: ${javaExecutable}`);
  } catch (error) {
    if (fs.existsSync(jreDir)) {
      await fs.remove(jreDir);
    }
    throw error;
  }
}

/**
 * Prepare backend JAR
 */
async function prepareBackend() {
  console.log('\n🔧 Preparing backend JAR...');

  if (!fs.existsSync(BACKEND_JAR_SOURCE)) {
    throw new Error(
      `Backend JAR not found at: ${BACKEND_JAR_SOURCE}\n\n` +
      `Please build the backend first:\n` +
      `  cd ../backend\n` +
      `  mvn clean package\n` +
      `  cd ../frontend\n`
    );
  }


  await fs.ensureDir(path.dirname(BACKEND_JAR_DEST));


  await fs.copy(BACKEND_JAR_SOURCE, BACKEND_JAR_DEST);
  
  const stats = await fs.stat(BACKEND_JAR_DEST);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`Backend JAR copied successfully`);
  console.log(`   Size: ${sizeInMB} MB`);
  console.log(`   Destination: ${BACKEND_JAR_DEST}`);
}

/**
 * Clean up temporary downloads
 */
async function cleanupTempDownloads() {
  const downloadDir = path.join(__dirname, '..', 'temp-downloads');
  if (fs.existsSync(downloadDir)) {
    console.log('\n🧹 Cleaning up temporary downloads...');
    await fs.remove(downloadDir);
    console.log('Cleanup complete');
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(' Electron Build Resources Preparation');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Create resources directory
    await fs.ensureDir(RESOURCES_DIR);

    // Prepare backend
    await prepareBackend();

    // Prepare JREs for each platform
    const platforms = [
      { platform: 'win', arch: 'x64' },
      { platform: 'linux', arch: 'x64' },
    ];

    for (const { platform, arch } of platforms) {
      await prepareJRE(platform, arch);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\nAll resources prepared successfully!');
    console.log(`Total time: ${duration} seconds`);
    await cleanupTempDownloads();
  } catch (error) {
    console.error('Error preparing resources');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}


if (require.main === module) {
  main();
}

module.exports = { prepareBackend, prepareJRE, cleanupTempDownloads };
