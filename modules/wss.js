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

// Short hand to send an error to client then close it
function wserror(ws, err) {
	ws.send(JSON.stringify({
		type: "err",
		msg : err
	}));
	ws.close();
	console.log("WSS error IP:", ws.ip, err);
}

module.exports.server = (s) => {

	const wss = new ws.Server({
		server: s,
		clientTracking: false,
	});

	wss.on("connection", (ws, req) => {

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
			/*
				// first check if room exists
				if ((ws.room in rooms)) {
					ws.room = rooms[ws.room];
				} else {
					wserror(ws, "Invalid room id");
					return;
				}
				// check if room is full
				if (ws.room.players.length === ws.room.gamemode.maxplayers) {
					wserror(ws, "Room is full");
					return;
				}
				// check if room is playing
				if (ws.room.playing) {
					wserror(ws, "Room is playing");
					return;
				}
			*/
			// these are now being handeled in https.js so that no wss connection has to be made to redirect back. This means less redirects
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
				value   : require(server(ws.room.gamemode.id)),
				writable: true
			});
			ws.gamehandle.init(clients, rooms);
			/*if (rooms[ws.room].playing) {// if playing use game handeler, otherwise use waiting handeler
				Object.defineProperty(ws, "handle", {
					value   : server(rooms[ws.room].gametype),
					writable: true
				});
				// if the gametype isn't valid (unfound) then don't require otherwise server will crash
				if (ws.handle) {
					ws.handle = require(ws.handle)
				} else {
					//wserror(ws, "Invalid game");
									
					return;
				}
			// } else {
			}*/
			
		}

		// If the handeler is undefined it means that theres.. well no handeler available so just close it.
		if (ws.handle === undefined) {
			wserror("Invalid game");
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
				wserror(ws, "Invalid JSON in msg");
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
