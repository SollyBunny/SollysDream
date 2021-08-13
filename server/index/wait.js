const gamemode = require("../..//modules/gamemode.js");

let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

function sendallexcept(ws, msg) {
	rooms[ws.room].players.forEach((i) => {
		console.log("WEJAIJDS", i);
		if (i !== ws.id) {
			clients[i].send(msg);
		}	
	});
}

function sendall(ws, msg) {
	rooms[ws.room].players.forEach((i) => {
		console.log("WAAAA", i)
		clients[i].send(msg);
	});
}

// Short hand to send an error to client then close it
function wserror(ws, err) {
	ws.send(JSON.stringify({
		type: "err",
		msg : err
	}));
	ws.close();
	console.log("WSS error IP:", ws.ip, err);
}

module.exports.onconnect = (ws) => {

	require("../../server/index/rooms.js").players.forEach((m) => {
		clients[m].send(JSON.stringify({
			type: "join",
			id  : ws.room
		}));
	});

	let initdata = new Array(rooms[ws.room].players.length * 2 + 4);

	initdata[0] = rooms[ws.room].id;
	initdata[1] = rooms[ws.room].gamemode;
	initdata[2] = rooms[ws.room].roomname;
	initdata[3] = rooms[ws.room].owner;
	initdata[4] = ws.id // give their own id to reference themselves
	
	let i = 5;
	rooms[ws.room].players.forEach((m) => {
		initdata[i    ] = clients[m].id;
		initdata[i + 1] = clients[m].name;
		initdata[i + 2] = clients[m].gamedata;
		i += 3;
	});

	ws.send(JSON.stringify({
		type: "init",
		data: initdata
	}));

	sendallexcept(ws, JSON.stringify({
		type: "join",
		data: [
			ws.id,
			ws.name
		]
	}));

	if (rooms[ws.room].players.length >= gamemode[rooms[ws.room].gamemode].minplayers) {
		sendall(ws, JSON.stringify({
			type: "ready"	
		}));
	}

};

module.exports.ondisconnect = (ws) => {
	// if the player was the owner of their room, kick everyone, remove the room, and send messages telling the room has been closed
	if (rooms[ws.room].owner === ws.id) {
		require("../../server/index/rooms.js").players.forEach((m) => {
			clients[m].send(JSON.stringify({
				type: "delete",
				id  : ws.room
			}));
		});	
		rooms[ws.room].players.forEach((i) => {
			clients[i].room   = undefined;
			clients[i].handle = undefined; // effectivly supress all handling of closing
			clients[i].send(JSON.stringify({
				type: "err",
				msg: "Invalid room id"
			}));
		});
		delete rooms[ws.room];
	} else {	
		require("../../server/index/rooms.js").players.forEach((m) => {
			clients[m].send(JSON.stringify({
				type: "leave",
				id  : ws.room
			}));
		});
		sendallexcept(ws, JSON.stringify({
			type: "leave",
			id  : ws.id
		}));
		if (rooms[ws.room].players.length < gamemode[rooms[ws.room].gamemode].minplayers) {
			sendallexcept(ws, JSON.stringify({
				type: "unready"	
			}));
		}
	}
};

module.exports.onmessage = (ws, data) => {

	console.log(data);

	switch (data.type) {

		case "start":

			if (ws.id != rooms[ws.room].owner) {
				wserror(ws, "You're not the owner");
				return;
			}

			console.log("starting gmae!!!");

			sendall(ws, JSON.stringify({
				type: "start"
			}));
			
			break;

		default:
			break;
			
	}

};
