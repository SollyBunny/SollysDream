const gamemode = require("../..//modules/gamemode.js");

let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

function sendallexcept(ws, msg) {
	ws.room.players.forEach((i) => {
		console.log("WEJAIJDS", i);
		if (i !== ws.id) {
			clients[i].send(msg);
		}	
	});
}

function sendall(ws, msg) {
	ws.room.players.forEach((i) => {
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

	let initdata = new Array(ws.room.players.length * 2 + 4);

	initdata[0] = ws.room.id;
	initdata[1] = ws.room.gamemode.id;
	initdata[2] = ws.room.roomname;
	initdata[3] = ws.room.owner.id;
	initdata[4] = ws.id // give their own id to reference themselves
	
	let i = 5;
	ws.room.players.forEach((m) => {
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

	if (ws.room.players.length >= ws.room.gamemode.minplayers) {
		sendall(ws, JSON.stringify({
			type: "ready"	
		}));
	}

};

module.exports.ondisconnect = (ws) => {
	// if the player was the owner of their room, kick everyone, remove the room, and send messages telling the room has been closed
	if (ws.room.owner === ws.id) {
		require("../../server/index/rooms.js").players.forEach((m) => {
			clients[m].send(JSON.stringify({
				type: "delete",
				id  : ws.room
			}));
		});	
		ws.room.players.forEach((i) => {
			clients[i].room   = undefined;
			clients[i].handle = undefined; // effectivly supress all handling of closing
			clients[i].send(JSON.stringify({
				type: "err",
				msg: "Invalid room id"
			}));
		});
		delete rooms[ws.room.id];
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
		if (ws.room.players.length < ws.room.gamemode.minplayers) {
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

			if (ws !== ws.room.owner) {
				wserror(ws, "You're not the owner");
				return;
			}

			console.log("starting gmae!!!");

			ws.room.playing = true;

			require("../../server/index/rooms.js").players.forEach((m) => {
				clients[m].send(JSON.stringify({
					type: "start",
					id  : ws.room.id
				}));
			});	

			sendall(ws, JSON.stringify({
				type: "start"
			}));

			ws.room.owner.gamehandle.start(ws);
			
			break;

		default:
			break;
			
	}

};
