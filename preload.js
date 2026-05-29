const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mtgHelper', {
  sendMessage: (message, history) => ipcRenderer.invoke('send-message', message, history)
});