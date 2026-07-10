import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, extname } from 'path'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Database from 'better-sqlite3'
import { initDB, createProject, getProjects, deleteProject } from './db/projects'
import { createQR, getQRsByProject, updateQRMetadata, deleteQR } from './db/qrs'
import icon from '../../resources/icon.png?asset'

const dbPath = join(app.getPath('userData'), 'qr-eterno.sqlite')
const db = new Database(dbPath)
initDB(db)

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers para Proyectos
  ipcMain.handle('db:get-projects', () => getProjects(db))
  ipcMain.handle('db:create-project', (_, name: string) => createProject(db, name))
  ipcMain.handle('db:delete-project', (_, id: number) => deleteProject(db, id))

  // IPC handlers para QRs
  ipcMain.handle('db:create-qr', (_, data) => createQR(db, data))
  ipcMain.handle('db:get-qrs-by-project', (_, projectId: number) => getQRsByProject(db, projectId))
  ipcMain.handle('db:update-qr-metadata', (_, id: number, updates: any) => updateQRMetadata(db, id, updates))
  ipcMain.handle('db:delete-qr', (_, id: number) => deleteQR(db, id))

  // IPC handlers para File System (Logos)
  ipcMain.handle('fs:select-logo', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Seleccionar Logo',
      properties: ['openFile'],
      filters: [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'svg'] }]
    })
    
    if (canceled || filePaths.length === 0) return null;
    
    const sourcePath = filePaths[0];
    const extension = extname(sourcePath);
    const uniqueFileName = `${randomUUID()}${extension}`;
    const uploadsDir = join(app.getPath('userData'), 'local_uploads');
    
    mkdirSync(uploadsDir, { recursive: true });
    const destPath = join(uploadsDir, uniqueFileName);
    copyFileSync(sourcePath, destPath);
    
    return destPath;
  })

  ipcMain.handle('fs:read-image', (_, filePath: string) => {
    try {
      const buffer = readFileSync(filePath);
      const extension = extname(filePath).toLowerCase().replace('.', '');
      let mimeType = 'image/png';
      if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
      if (extension === 'svg') mimeType = 'image/svg+xml';
      
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (e) {
      return null;
    }
  })

  // IPC handlers para Exportación (Issue 5)
  ipcMain.handle('fs:export-svg', async (_, filename: string, svgContent: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Exportar Código QR',
      defaultPath: `${filename}.svg`,
      filters: [{ name: 'Gráficos Vectoriales Escalares (SVG)', extensions: ['svg'] }]
    })
    
    if (canceled || !filePath) return false;
    
    const finalSvg = svgContent.includes('xmlns') ? svgContent : svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    writeFileSync(filePath, finalSvg);
    return true;
  })

  ipcMain.handle('fs:export-png', async (_, filename: string, dataUrl: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Exportar Código QR (PNG)',
      defaultPath: `${filename}.png`,
      filters: [{ name: 'Imagen PNG', extensions: ['png'] }]
    })
    
    if (canceled || !filePath) return false;
    
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    writeFileSync(filePath, base64Data, 'base64');
    return true;
  })

  ipcMain.handle('fs:export-batch', async (_, files: {filename: string, content: string}[]) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Seleccionar Carpeta para Exportación en Lote',
      properties: ['openDirectory', 'createDirectory']
    })
    
    if (canceled || filePaths.length === 0) return 0;
    
    const targetDir = filePaths[0];
    let count = 0;
    
    for (const file of files) {
      const safeName = file.filename.replace(/[/\\?%*:|"<>]/g, '-');
      const finalSvg = file.content.includes('xmlns') ? file.content : file.content.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      writeFileSync(join(targetDir, `${safeName}.svg`), finalSvg);
      count++;
    }
    
    return count;
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
