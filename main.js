const {app, Menu, Tray, BrowserWindow, nativeImage, ipcMain} = require('electron')

const path = require('path')
const fs = require('fs')
const url = require('url')
const child_process	= require('child_process')
const _ = require('underscore')

const DEBUG = false
const CWD 			= process.cwd()
const execOpts = { cwd: CWD, stdio:[0,1,2], sync: true } // stdio is only needed for execSync|spawn
const settingsPath = path.join(app.getPath('userData'), 'settings.json')
const assetsDirectory = path.join(__dirname, 'assets')

var settings = {}
const Settings = require('libs/settings');

app.dock.hide()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray

/////////////
// Helpers //
/////////////

const log = (err, stdout, stderr) => {
	if (err) process.stdout.write(`${err}\n`)

	if (stderr != null && stderr != "") process.stdout.write(`${stderr}\n`)
	if (stdout != null && stdout != "") process.stdout.write(`${stdout}\n`)
}

const execute = (cmd, opts, callback) => {
	if (_(opts).isFunction()) {
		callback = opts
		opts = {}
	}
	opts = _(execOpts).extend(opts)

	if (opts.sync || !_.isArray(cmd)) {
		if (DEBUG) console.log("--", "Sync command: ", JSON.stringify(cmd), JSON.stringify(opts), callback)

		if (_.isArray(cmd)) cmd = cmd.join(" ") //escape(cmd)
		child_process.exec(cmd, opts, callback)
	} else {
		return new Promise((resolve, reject) => {
			if (DEBUG) console.log("--", "Spawn command", JSON.stringify(cmd), cmd.join(" "), JSON.stringify(opts))

			let spawned = child_process.spawn(cmd.shift(), cmd, opts)
			spawned.on("close", (err) => {
				if (err != 0) log(`Process exited with code ${err}`, false, false)

				if (err != 0) reject(err, false, false)
				//else reject(err)
			})

			spawned.stdout.on('data', (data) => {
				if (callback) callback(false, data, false)
				else resolve(data)
			})
		})
	}
}

/////////////
///// UI ////
/////////////

const getWindowPosition = () => {
	const windowBounds = mainWindow.getBounds()
	const trayBounds = tray.getBounds()

	// Center window horizontally below the tray icon
	const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

	// Position window 4 pixels vertically below the tray icon
	const y = Math.round(trayBounds.y + trayBounds.height + 4)

	return {x: x, y: y}
}

const toggleWindow = () => {
	if (mainWindow.isVisible()) {
		mainWindow.hide()
	} else {
		showWindow()
	}
}

const showWindow = () => {
	const position = getWindowPosition()
	mainWindow.setPosition(position.x, position.y, false)
	mainWindow.show()
	mainWindow.focus()
}

const getTrayMenu = function () {
	return Menu.buildFromTemplate([
		{
			type :'separator'
		},   
		{
			label: 'Quit',
			click() {  app.quit() }             
		}
	])
}


function createTray() {

	tray = new Tray(path.join(assetsDirectory, 'logoTemplate.png'))
	tray.on('right-click', () => { tray.popUpContextMenu( getTrayMenu() ) } )
	tray.on('double-click', toggleWindow)
	tray.on('click', toggleWindow)

	createWindow()

	return true
}

function createWindow (state) {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 300, 
		height: 350,
		show: false,
		frame: false,
		fullscreenable: false,
		resizable: false,
		transparent: false,
		webPreferences: {
			backgroundThrottling: false
		}
	})

	mainWindow.custom = {
		'currentState': state ? state : 'index'
	}

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/client/public/index.html'),
		protocol: 'file:',
		slashes: true
	}))

	// Hide the window when it loses focus
	mainWindow.on('blur', () => {
		if (!mainWindow.webContents.isDevToolsOpened()) {
		  mainWindow.hide()
		}
	})
}

/////////////
//// APP ////
/////////////


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

(function() {
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', function() {
		// createWindow()
		ipcMain.on('callSyncMethod', (event, type, data) => {
			if (DEBUG) console.log(type, data)
			switch(type){
				case "getCurrentUser":
					event.returnValue = {}
					break
			}
		})

		// Do stuff here
		Settings.readSettings()
	})

	// Quit when all windows are closed.
	app.on('window-all-closed', function () {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	app.on('activate', function () {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (mainWindow === null) {
			createWindow()
			createTray()
		}
	})
})()