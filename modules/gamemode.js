/*
	This will read the server, client and index files in /games allowing them to be loaded, unloaded and reloaded
	It will also compile a gamemode.json file which will emulate the old system so that clients can still acsess gamemode data normally
	It also preloads files to reduce read write calls (probaly cached by os but eh)
*/

// the folder where games are stored (soz for absolute path)
const file = "/home/solly/Documents/Webserver/game";

const fs = require("fs");

/*
// By adding to expectedloadedgames before its loaded we can also add to loadedgames once its loaded which means we can load all games at the same time waiting until all games which should be loaded are loaded
// Because there's no way of determining when all 3 files per game have been loaded each game will have a value of 3 in this 
let loadedgames = 0;
let expectedloadedgames = 0; TODO*/

module.exports = {};
module.exports._gamemode = {} // a dictionary containing pointers only to module.exports.0/1 etc so can be securly sent to client

// TODO somehow switch to ids instead of names to load even if the folders are named not numbered, one way of doing this is exploring all files in there but thats ineffecient
// Load a game
module.exports.loadgame = (name) => {

	// Temporary var for path of game
	let tpath = `${file}/${name}/`

	// Check if all files exist for module
	if (!fs.existsSync(tpath)) {
		console.log(`No module named "${name}" found`);
		return;	
	}
	if (!fs.existsSync(tpath + "index.json")) {
		console.log(`Module "${name}" does not contain "index.json"`);
		return;	
	}
	if (!fs.existsSync(tpath + "client.html")) {
		console.log(`Module "${name}" does not contain "client.html"`);
		return;	
	}
	if (!fs.existsSync(tpath + "server.js")) {
		console.log(`Module "${name}" does not contain "server.js"`);
		return;	
	}

	// Stores the gamemode data (id)
	let tindex = JSON.parse(fs.readFileSync(tpath + "index.json"));

	
	module.exports[tindex.id]           = tindex; // set gamemode data
	module.exports._gamemode[tindex.id] = Object.assign({}, tindex); 

	module.exports[tindex.id].client = fs.readFileSync(tpath + "client.html");
	module.exports[tindex.id].server = require(tpath + "server.js");

};

module.exports.loadall = () => {

	fs.readdirSync(file).forEach((f) => {
		module.exports.loadgame(f);
	});
	
};
