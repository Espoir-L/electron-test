// Modules to control application life and create native browser window
const {
    app,
    BrowserWindow
} = require('electron')
const path = require('path')
const minimist = require('minimist');
const args = minimist(process.argv.slice(2));

process.setFdLimit(8192);

console.log('args---', args);

async function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    mainWindow.webContents.once('dom-ready', () => {
        console.log('dom-ready');
        console.log(JSON.stringify({ code: 200 }));
    });
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

app.on('ready', async () => {
    console.log('main---ready==');
    await createWindow();
});

app.on('activate', () => {});

app.on('window-all-closed', () => {
});
