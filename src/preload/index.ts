import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  db: {
    getProjects: () => ipcRenderer.invoke('db:get-projects'),
    createProject: (name: string) => ipcRenderer.invoke('db:create-project', name),
    deleteProject: (id: number) => ipcRenderer.invoke('db:delete-project', id),
    createQR: (data: any) => ipcRenderer.invoke('db:create-qr', data),
    getQRsByProject: (projectId: number) => ipcRenderer.invoke('db:get-qrs-by-project', projectId)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
