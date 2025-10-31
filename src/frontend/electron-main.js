const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const log = require('electron-log');



const BACKEND_PORT = 8080;
const BACKEND_HOST = 'localhost';
const BACKEND_HEALTH_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/actuator/health`;
const MAX_STARTUP_ATTEMPTS = 60; 
const HEALTH_CHECK_INTERVAL = 1000;

let mainWindow;
let backendProcess;
let isQuitting = false;


const isDev = !app.isPackaged;

if (isDev) {
  // If we use electron during development the log file should be in this folder /src/frontend/logs
  log.transports.file.resolvePathFn = () => path.join(__dirname, '..', 'logs', 'main.log');
}
log.transports.file.level = 'info';
log.transports.console.level = isDev ? 'debug' : 'info';
log.transports.file.maxSize = 5 * 1024 * 1024; 
log.info('='.repeat(70));
log.info('Application starting');
log.info(`Log file: ${log.transports.file.getFile().path}`);


/**
 * This function is only for getting the jre in production builds.
 * In development, it assumes Java is installed and available in PATH.
 */
function getJavaPath() {
  if (isDev) {
    return process.platform === 'win32' ? 'java.exe' : 'java';
  } else {
    const jreBinDir = path.join(process.resourcesPath, 'jre', 'bin');
    return process.platform === 'win32'
      ? path.join(jreBinDir, 'java.exe')
      : path.join(jreBinDir, 'java');
  }
}

/**
 * Get the path to the backend JAR file
 * During devel
 */
function getBackendJarPath() {
  if (isDev) {
    return path.join(__dirname, '..', 'backend', 'target', 'literature-review-helper-0.0.1-SNAPSHOT.jar');
  } else {
    return path.join(process.resourcesPath, 'backend', 'backend.jar');
  }
}

/**
 * Start the Java backend process
 */
function startBackend() {
  return new Promise((resolve, reject) => {
    const javaPath = getJavaPath();
    const jarPath = getBackendJarPath();

    if (!fs.existsSync(jarPath)) {
      const error = `Backend JAR not found at: ${jarPath}`;
      log.error(error);
      reject(new Error(error));
      return;
    }

    log.info(`Starting backend: ${javaPath} -jar ${jarPath}`);


    backendProcess = spawn(javaPath, ['-jar', jarPath], {
      cwd: path.dirname(jarPath),
      env: {
        ...process.env,
        SERVER_PORT: BACKEND_PORT.toString()
      }
    });


    backendProcess.stdout.on('data', (data) => {
      log.info(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      log.warn(`[Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
      log.error('[Backend] Failed to start:', error);
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      log.info(`[Backend] Process exited with code ${code} and signal ${signal}`);
      if (!isQuitting && code !== 0) {
        dialog.showErrorBox(
          'Backend Error',
          `The backend process stopped unexpectedly. Exit code: ${code}`
        );
        app.quit();
      }
    });


    waitForBackend()
      .then(() => {
        log.info('[Backend] Ready!');
        resolve();
      })
      .catch((error) => {
        log.error('[Backend] Failed to start:', error);
        reject(error);
      });
  });
}

/**
 * Wait for backend to respond to health checks
 */
function waitForBackend() {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkHealth = () => {
      attempts++;
      log.debug(`[Backend] Health check attempt ${attempts}/${MAX_STARTUP_ATTEMPTS}`);

      http.get(BACKEND_HEALTH_URL, (res) => {
        if (res.statusCode === 200) {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const health = JSON.parse(data);
              if (health.status === 'UP') {
                resolve();
              } else {
                scheduleNextCheck();
              }
            } catch (error) {
              scheduleNextCheck();
            }
          });
        } else {
          scheduleNextCheck();
        }
      }).on('error', (error) => {
        if (attempts >= MAX_STARTUP_ATTEMPTS) {
          reject(new Error(`Backend failed to start after ${MAX_STARTUP_ATTEMPTS} attempts`));
        } else {
          scheduleNextCheck();
        }
      });
    };

    const scheduleNextCheck = () => {
      if (attempts < MAX_STARTUP_ATTEMPTS) {
        setTimeout(checkHealth, HEALTH_CHECK_INTERVAL);
      } else {
        reject(new Error(`Backend failed to start after ${MAX_STARTUP_ATTEMPTS} attempts`));
      }
    };

    checkHealth();
  });
}

/**
 * Stop the backend process
 */
function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    log.info('[Backend] Stopping...');
    isQuitting = true;


    backendProcess.kill('SIGTERM');

    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        log.warn('[Backend] Force killing...');
        backendProcess.kill('SIGKILL');
      }
    }, 5000);
  }
}

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js')
    },
    show: false 
  });

  if (isDev) {

    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); 
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }


  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Initialize the application
 */
async function initialize() {
  try {
    log.info('[App] Starting...');
    log.info(`[App] Running in ${isDev ? 'development' : 'production'} mode`);

    await startBackend();


    createWindow();

    log.info('[App] Initialized successfully');
  } catch (error) {
    log.error('[App] Initialization failed:', error);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start the application:\n\n${error.message}`
    );
    app.quit();
  }
}


app.whenReady().then(initialize);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopBackend();
});

app.on('will-quit', (event) => {
  if (backendProcess && !backendProcess.killed) {
    event.preventDefault();
    stopBackend();
    setTimeout(() => {
      app.exit(0);
    }, 1000);
  }
});

process.on('uncaughtException', (error) => {
  log.error('[App] Uncaught exception:', error);
  dialog.showErrorBox('Unexpected Error', error.message);
});
