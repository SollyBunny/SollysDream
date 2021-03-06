"use strict";

const fs  = require("fs");
const ws  = require("ws");
const url = require("url");

const gamemode = require("./gamemode.js");

/* 
	When server.js gets updated in fs, reload it 
	Defines global var "server", a function which takes a url (from ws connect) and returns the appropriate handeler script (stored in /server/)
*/
var server = require("../misc/server.js");
fs.watchFile("./misc/server.js", (e) => {
	delete require.cache[require.resolve("../misc/server.js")]
	server = require("../misc/server.js");
	console.log("Reloaded server.js")
});

/*
	A dictionary of all websockets using key:value id:ws
	Id will just be the current time in ms
	Pointer is given to each ws to reference other ws (other players)
*/
let clients = {};

/*
	Dictionary storing all the rooms globally.
	Is passed to every ws. 
	Although ineffecient in the respect of needing to have lengthy expressions (ie ws.rooms[ws.room].players) it is needed to:
		1. Reference other rooms 
		2. Be able to easly handle multiple players in the same script (without over engeneering)
		3. Create/delete/edit rooms (and their data)
*/
let rooms   = {};
module.exports.rooms = rooms;

// behaviour moved to https.js
// The regex check to see if a username is valid (only contains a-zA-Z0-9_) so that they can't include html elements (arbritrary code execution)
//let check = (/^[a-zA-Z0-9_]+$/);

// Method for game handelers to check if it's safe to run code
function _safe() {
	return (this && clients[this.id] && this.room && this.room.playing);
}

// Method too give error to client and close it
function _error(err) {
	this.send(JSON.stringify({
		type: "err",
		msg : err
	}));
	this.close();
	console.log("WSS error IP:", ws.ip, err);
}

module.exports.server = (s) => {

	const wss = new ws.Server({
		server: s,
		clientTracking: false,
	});

	wss.on("connection", (ws, req) => {

		// Add methods to the ws
		Object.defineProperty(ws, "_safe", {
			value   : _safe,
			writable: false
		});
		Object.defineProperty(ws, "_error", {
		value   : _error,
		writable: false
	});

		// Add properties to the ws
		Object.defineProperty(ws, "ip", {
			value   : req.connection.remoteAddress,
			writable: true
		});
		Object.defineProperty(ws, "url", {
			value   : url.parse(req.url),
			writable: true
		});
		Object.defineProperty(ws, "name", {
			value   : req.headers.cookie,
			writable: true
		});
		Object.defineProperty(ws, "id", {
			value   : new Date().getTime(),
			writable: false
		});

		/*
			The handeler is the script which handles all the events for a specific game type
			This allows me to abstract handling making code cleaner.
		*/
		if (ws.url.query === null) { // We aren't using the room system so just hand it over to the handeler
			/*Object.defineProperty(ws, "room", {
				value   : undefined,
				writable: true
			});*/
			Object.defineProperty(ws, "handle", {
				value   : require(server(ws.url.pathname)),
				writable: true
			});
		} else { // A room id has been specified in the query so we have to figure out what gamemode (what handeler to use)
			Object.defineProperty(ws, "room", {
				value   : rooms[ws.url.query],
				writable: true
			});
			//console.log(ws.room);
			// data which handelers use to run games (stops from polluting player);
			Object.defineProperty(ws, "data", {
				value   : {},
				writable: true
			});
			if (!ws.room) { // incase corrupted room
				ws._error("Invalid room");
			}
			ws.room.players.push(ws.id);
			// if the game hasnt started and theres no owner assume this player (the first player to join) is the owenr
			if (ws.room.owner === undefined) {
				ws.room.owner = ws;
			}
			Object.defineProperty(ws, "handle", {
				value   : require("../server/index/wait.js"),
				writable: true
			});
			Object.defineProperty(ws, "gamehandle", {
				value   : gamemode[ws.room.gamemode.id].server,
				writable: true
			});
			ws.gamehandle.init(clients, rooms);
			
		}

		// If the handeler is undefined it means that theres.. well no handeler available so just close it.
		if (ws.handle === undefined) {
			ws._error("Invalid game");
			return;
		}
		console.log("WSS IP:", ws.ip, "Url:", ws.url.path, "Cookie:", ws.name);

		clients[ws.id] = ws;
		ws.handle.init(clients, rooms);

		// On msg, will be in plain text json (ineffecient but easy)
		ws.on("message", (data) => {
			// Try parsing the data as JSON, if it doesn't work close the ws, somethings gone wrong (stops the server from crashing on invalid msg)
			try {
				data = JSON.parse(data); 
			} catch (e) {
				ws._error("Invalid JSON in msg");
				return;
			}
			// Handle the msg
			if (ws.room && ws.room.playing) {
				ws.gamehandle.onmessage(ws, data);
			} else {
				ws.handle.onmessage(ws, data);
			}
		});
	
		ws.on("close", () => {
			
			if (ws.room) { // if player in a room, remove them

				// if there are no more players left or the player leaving was the owner close the room
				if (
					(ws.room.players.length === 0) ||
					(ws.room.owner.id === ws.id)
				) {
					console.log("destroyed");
					ws.room._destroy(ws);
					return;
				}
				
				ws.room.players.splice(ws.room.players.indexOf(ws.id), 1);
				//delete rooms[ws.room].players[ws.id];
			
			}
			if (ws.handle) {// Some ws may of errored out before initing the handle so make sure it's actually t
				ws.handle.ondisconnect(ws);	
			}
			delete clients[ws.id]; // delete all references of client data / ws after all handling is done
		});

		// We don't do ws.on("connect") etc because the event has already triggered so we just pretend here.
		ws.handle.onconnect(ws);
	
	});

};
