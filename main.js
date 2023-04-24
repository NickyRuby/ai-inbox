// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { globalShortcut } = require("electron");
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai")

const configuration = new Configuration({
    apiKey: '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',
    });

const appServer = express();
const port = 3000;

appServer.use(cors()); // enable CORS
appServer.use(express.json()); // parse JSON request bodies
appServer.use(express.static(path.join(__dirname, "dist")));
appServer.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});

appServer.get("/", (req, res) => {
  res.redirect("http://localhost:8080");
  console.log("yo");
});

appServer.post("/api/data", async (req, res) => {
  const filePath = path.join(__dirname, "storage.json");
  // try {
  //   const data = {};
  //   data[req.body.title] = req.body;
  //   const json = JSON.stringify(data);
  //   console.log(req.body);

  //   fs.writeFile(filePath, json, { encoding: "utf8",  flag: 'a'}, (err) => {
  //     if (err) throw err;
  //     console.log("Data written to file (from await)");
  //   });
  //   res.status(200).json({ message: "Data recorded to client" });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: "Failed to get data data to file" });
  // }

  try {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err
    
      const todoData = JSON.parse(data)
      todoData[req.body.title] = req.body
    
      const json = JSON.stringify(todoData)
    
      fs.writeFile(filePath, json, { encoding: 'utf8' }, (err) => {
        if (err) throw err
        console.log('Data written to file')
        res.status(200).json({ message: "Data recorded to client" });
      })
    })
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get data data to file" });
    }
});





appServer.get("/api/data/:phrase", async (req, res) => {
  const filePath = path.join(__dirname, "storage.json");
  try {
    fs.readFile(filePath, 'utf8', async (err, data) => {
      if (err) throw err;
      const todoData = JSON.parse(data);
      const firstValues = Object.values(todoData).map(value => value.title);
      console.log(firstValues);
      const filteredTasks = await askGPT(firstValues, req.params.phrase);
      res.status(200).json(filteredTasks);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get data from file" });
  }  
});


async function askGPT(arrayOfTasks,phrase) {

  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "В тебе є наступний список з задач: \n" + arrayOfTasks + "\nВідправь у відповіть тільки ті задачі що мають велику ймовірність відношення до фрази: " + phrase + "Відповіть має бути одним реченням, де перелічені відфільтровані задачі через знак ʼ,ʼ. Якщо ймовірність відношення до фрази маленька — дай відповідь: 'Нічого не знайдено'",
      temperature: 0.67,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
  });
  return response.data.choices[0].text.split(", ");
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 300,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:8080/");
  mainWindow.setAlwaysOnTop(true, "pop-up-menu");

  const ret = globalShortcut.register("Option+N", () => {
    console.log("hotkey is pressed");
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });

  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// Open the DevTools.
// mainWindow.webContents.openDevTools()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
});

// app.dock.hide()

app.whenReady().then(() => {
  // Register a 'CommandOrControl+X' shortcut listener.

  if (!ret) {
    console.log("registration failed");
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered("CommandOrControl+X"));
});

app.on("will-quit", () => {
  // Unregister a shortcut.
  globalShortcut.unregister("CommandOrControl+X");

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
