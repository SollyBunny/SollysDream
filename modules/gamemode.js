/*
	This file is a wrapper for /misc/gamemode.json
	It contains the names/minplayers/maxplayers/etc (gamemode data) for each gamemode
	Instead for each instance where it's needed manually watching/loading the file I can use a request too spread the same watch/load for multiple scripts
	This is because request caching will mean only 1 of this script is ran 
	This file is also for the website too allow the ui to show the max/min players, and the name of the gamemode
	It will be client side cached meaning I only have to send in a single number (gamemode id) for the client to know all the info about it
*/

"use strict";

const fs = require("fs");

const file = "/home/solly/Documents/Webserver/misc/gamemode.json";

// When gamemode.json gets updated in fs, reload it
module.exports = JSON.parse(fs.readFileSync(file));
fs.watchFile(file, (e) => {
	module.exports = JSON.parse(fs.readFileSync(file));
	console.log(file);
});
