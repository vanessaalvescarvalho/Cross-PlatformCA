//requiring electron, fs and uuid
const electron = require("electron");
const fs = require("fs");
const uuid = require("uuid");


const { app, BrowserWindow, Menu, ipcMain } = electron;

//creating windows
let window;


let allTasks = [];

fs.readFile("db.json", (err, jsonTasks) => {
  if (!err) {
    const oldTasks = JSON.parse(jsonTasks);
    allTasks = oldTasks;
  }
});

app.on("ready", () => {
  window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    fullscreen: false,
    width: 1080,
    height: 800,
    title: "Vanessa"
  });
  window.loadURL(`file://${__dirname}/index.html`);
  window.on("closed", () => {
    const jsonTasks = JSON.stringify(allTasks);
    fs.writeFileSync("db.json", jsonTasks);

    app.quit();
    window = null;
  });

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
  
});



ipcMain.on("task:create", (event, task) => {
  task["id"] = uuid();
  task["done"] = 0;
  allTasks.push(task);

  sendTodayTasks();
  // createWindow.close();
});

ipcMain.on("task:request:list", event => {
  window.webContents.send("task:response:list", allTasks);
});

ipcMain.on("task:request:today", event => {
  sendTodayTasks();
});

ipcMain.on("task:done", (event, id) => {
  allTasks.forEach(task => {
    if (task.id === id) task.done = 1;
  });

  sendTodayTasks();
});

const sendTodayTasks = () => {
  const today = new Date().toISOString().slice(0, 10);
  const filtered = allTasks.filter(
    task => task.date === today
  );
  window.webContents.send("task:response:today", filtered);
};

const menuTemplate = [
  {
    label: "File",

    submenu: [
      {
        label: "Quit",

        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",

        
        click() {
          app.quit();
        }
      }
    ]
  },
  {
    label: "View",
    submenu: [{ role: "reload" }]
  }
];
