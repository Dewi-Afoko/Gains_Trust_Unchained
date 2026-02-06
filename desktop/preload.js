const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script for Electron
 * Exposes safe APIs to the renderer process via contextBridge
 * This maintains security by not exposing Node.js APIs directly
 */

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Get the Django server URL
   * @returns {Promise<string>}
   */
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),

  /**
   * Get the application version
   * @returns {Promise<string>}
   */
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  /**
   * Show an error dialog to the user
   * @param {string} message - The error message to display
   * @returns {Promise<void>}
   */
  showError: (message) => ipcRenderer.invoke('show-error-dialog', message),

  /**
   * Check if running in Electron (useful for conditional behavior)
   * @returns {boolean}
   */
  isElectron: () => true,
});

// Log that preload script has loaded
console.log('Electron preload script loaded');
