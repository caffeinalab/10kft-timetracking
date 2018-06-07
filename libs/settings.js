
module.exports.readSettings = function () {
	return new Promise((resolve, reject) => {
		try {
			settings = fs.readFileSync(settingsPath, 'utf-8')
			settings = JSON.parse(settings)
			if (DEBUG) console.log('Loaded file:' + settingsPath, settings)
			resolve(settings)
		} catch (err) {
			if (DEBUG) console.log('Error reading the file: ' + JSON.stringify(err))
			reject(null)
		}
	})
}

module.exports.saveSettings = function () {
  try { 
	fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf-8') 
  }
  catch(e) { 
	console.log('Failed to save the file !') 
  }
}

module.exports.insertOrUpdateSetting = function (ob) {
	if(!settings.profiles) { settings.profiles = {} }
	_(settings.profiles).extend(ob)
	saveSettings()
}

module.exports.removeSetting = function (key) {
	if(!settings.profiles || settings.profiles[key] == null) return
	delete settings.profiles[key]
	saveSettings()
}

module.exports.getAllSettings = function () {
	return settings.profiles
}

module.exports.activateSetting = function (key) {
	if (settings.profiles[key]) setGitInfo(key)
}

module.exports.getAutoStart = function () {
	return settings.autostart ? settings.autostart : false
}

module.exports.toggleAutoStart = function () {
	settings.autostart = !getAutoStart();
	setAutoStart()
}

module.exports.setAutoStart = function () {

	app.setLoginItemSettings({
		openAtLogin: !! settings.autostart,
	});

	saveSettings()
}