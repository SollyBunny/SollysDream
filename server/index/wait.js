const gamemode = require("../..//modules/gamemode.js");

let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

function sendallexcept(ws, msg) {
	ws.room.players.forEach((i) => {
		if (i !== ws.id) {
			clients[i].send(msg);
		}	
	});
}

function sendall(ws, msg) {
	ws.room.players.forEach((i) => {
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
			id  : ws.room.id
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
		i += 2;
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
	require("../../server/index/rooms.js").players.forEach((m) => {
		clients[m].send(JSON.stringify({
			type: "leave",
			id  : ws.room.id
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
	if (ws.room.playing) {
		ws.room.owner.gamehandle.ondisconnect(ws);
	}
};

module.exports.onmessage = (ws, data) => {

	console.log(data);

	switch (data.type) {

		case "chatmsg":
			sendallexcept(ws, JSON.stringify({
				type: "chatmsg",
				msg: data.msg,
				id: ws.id
			}));
			break;

		case "start":

			if (ws.id !== ws.room.owner.id) {
				wserror(ws, "You're not the owner");
				return;
			}

			console.log("starting game!");

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
