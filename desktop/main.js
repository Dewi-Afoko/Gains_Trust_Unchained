const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const DjangoManager = require('./backend/djangoManager');

// Configuration
const isDev = process.env.NODE_ENV === 'development';
const REACT_DEV_PORT = 3000;

// Paths
const BACKEND_DIR = isDev
  ? path.join(__dirname, '..', 'Gains_Trust')
  : path.join(process.resourcesPath, 'backend');

// Global state
let mainWindow = null;
let djangoManager = null;
let serverUrl = '';

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    title: 'Gains Trust',
    backgroundColor: '#1a1a1a',
    show: false, // Don't show until ready
  });

  // Show window when content is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the appropriate URL
  if (isDev) {
    // In development, load from React dev server
    mainWindow.loadURL(`http://localhost:${REACT_DEV_PORT}`);
    // Open dev tools if explicitly requested
    if (process.env.OPEN_DEVTOOLS === 'true') {
      mainWindow.webContents.openDevTools();
    }
  } else {
    // In production, load from Django server
    mainWindow.loadURL(serverUrl);
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Setup IPC handlers for communication with renderer process
 */
function setupIpcHandlers() {
  // Get server URL
  ipcMain.handle('get-server-url', () => {
    return serverUrl;
  });

  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Show error dialog
  ipcMain.handle('show-error-dialog', (event, message) => {
    dialog.showErrorBox('Error', message);
  });
}

/**
 * Initialize and start the application
 */
async function startApp() {
  try {
    console.log('Starting Gains Trust Desktop App...');
    console.log('Environment:', isDev ? 'Development' : 'Production');
    console.log('Backend directory:', BACKEND_DIR);

    // Create Django manager
    djangoManager = new DjangoManager(BACKEND_DIR, isDev);

    // Start Django server (skip in dev mode - it's started by npm run dev:backend)
    if (isDev) {
      // In dev mode, assume Django is already running on default port
      serverUrl = 'http://127.0.0.1:8000';
      console.log('Development mode: Using Django server at', serverUrl);
    } else {
      // In production, start Django server
      console.log('Starting Django server...');
      serverUrl = await djangoManager.start();
      console.log(`Django server running at ${serverUrl}`);
    }

    // Setup IPC handlers
    setupIpcHandlers();

    // Create window
    createWindow();

    console.log('Application started successfully!');
  } catch (error) {
    console.error('Failed to start application:', error);
    console.error('Error stack:', error.stack);

    // Show detailed error dialog to user
    const errorDetails = error.stack || error.message;
    dialog.showMessageBox({
      type: 'error',
      title: 'Gains Trust - Startup Error',
      message: 'Failed to start Gains Trust',
      detail: `${error.message}\n\nPlease check:\n✓ Python 3.9+ is installed\n✓ PostgreSQL is running (port 5432)\n✓ Database 'gains_trust' exists\n\nTechnical details:\n${errorDetails}`,
      buttons: ['Quit', 'View Logs'],
    }).then(result => {
      if (result.response === 1) {
        // View logs
        require('child_process').exec('open ~/Library/Logs/Gains\\ Trust/');
      }
      app.quit();
    });
  }
}

/**
 * Stop Django server gracefully
 */
async function stopDjango() {
  if (djangoManager && djangoManager.isRunning()) {
    console.log('Stopping Django server...');
    await djangoManager.stop();
    console.log('Django server stopped');
  }
}

// === APP LIFECYCLE EVENTS ===

// App is ready
app.on('ready', async () => {
  await startApp();
});

// All windows closed
app.on('window-all-closed', () => {
  // On macOS, apps typically stay open until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before quit - cleanup
app.on('before-quit', async (event) => {
  if (djangoManager && djangoManager.isRunning()) {
    event.preventDefault();
    await stopDjango();
    app.quit();
  }
});

// Activate (macOS specific - reopening app)
app.on('activate', () => {
  // Recreate window if closed
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
