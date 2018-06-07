
const DEBUG = false
const CWD 			= process.cwd()
const execOpts = { cwd: CWD, stdio:[0,1,2], sync: true } // stdio is only needed for execSync|spawn
const settingsPath = path.join(app.getPath('userData'), 'settings.json')

const Settings = require('settings');

// Authentication


// Get schedule for day


// Save schedule


// Add schedule


// List Projects