const { contextBridge, ipcRenderer } = require('electron');

/**
 * Electron Preload Script
 * 
 * This is a script that runs in the preload context of the Electron renderer process.
 * It exposes objects to the frontend via the contextBridge API.
 * To Access them in the frontend, use:
 *  window.electronAPI
 */

contextBridge.exposeInMainWorld('electronAPI', {
  
  platform: process.platform,
  isElectron: true
});

console.log('[Preload] Script loaded');
