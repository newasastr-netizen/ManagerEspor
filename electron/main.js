const { app, BrowserWindow } = require('electron');
const path = require('path');

// Geliştirme modunda mı yoksa üretimde mi olduğumuzu kontrol et
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Basit localStorage erişimi için
    },
    icon: path.join(__dirname, '../public/favicon.ico'), // Varsa ikonunuz
    autoHideMenuBar: true, // Üst menüyü gizle
  });

  if (isDev) {
    // Geliştirme modunda Vite sunucusunu dinle
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools(); // Hata ayıklama panelini aç
  } else {
    // Üretim modunda build edilen dosyayı oku
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

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