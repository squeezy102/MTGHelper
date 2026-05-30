const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mtgHelper', {
  sendMessage:          (message, history) => ipcRenderer.invoke('send-message', message, history),
  getCatalogStatus:     ()                 => ipcRenderer.invoke('get-catalog-status'),
  popoutTab:            (tabName)          => ipcRenderer.invoke('popout-tab', tabName),
  getViewAssignment:    ()                 => ipcRenderer.invoke('get-view-assignment'),
  relayCardsToLookup:   (payload)          => ipcRenderer.invoke('relay-cards-to-lookup', payload),
  onTabReturned:        (cb) => ipcRenderer.on('tab-returned',       (_, tabName) => cb(tabName)),
  onCardsFromChat:      (cb) => ipcRenderer.on('cards-from-chat',    (_, payload) => cb(payload)),
  onSendCurrentCards:   (cb) => ipcRenderer.on('send-current-cards', ()           => cb()),
});
