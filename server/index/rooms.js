const gamemode = require("../..//modules/gamemode.js");

let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

module.exports.players = [];

function sendallexcept(id, msg) {
	module.exports.players.forEach((i) => {
		if (i !== id) {
			clients[i].send(msg);
		}	
	});
}

module.exports.onconnect = (ws) => {

	module.exports.players.push(ws.id);

	let keys     =     Object.keys(rooms); 
	let initdata = new Array(keys.length * 6);

	let i = 0;
	console.log(rooms);
	keys.forEach((m) => {
		initdata[i    ] = m;
		initdata[i + 1] = rooms[m].gamemode.id;
		initdata[i + 2] = rooms[m].roomname;
		initdata[i + 3] = rooms[m].owner ? rooms[m].owner.name : "No One?";
		initdata[i + 4] = rooms[m].players.length; 
		initdata[i + 5] = rooms[m].playing;
		i += 6;	
	});

	ws.send(JSON.stringify({
		type: "init",
		data: initdata
	}));

};

module.exports.ondisconnect = (ws) => {
	module.exports.players.splice(module.exports.players.indexOf(ws.id), 1);
};


module.exports.onmessage = (ws, data) => {

	console.log(data);

	switch (data.type) {

		case "make":
			if (!(gamemode[data.gamemode])) {
				return;
			}
			let t = new Date().getTime();
			rooms[t] = {
				id          : t,
				gamemode    : gamemode[data.gamemode],
				roomname    : data.roomname,
				owner       : undefined, // we dont know their final id so just leave empty for now
				players     : [], // list of ids referneced to clients[id]
				playing     : false,
				data        : {}
			};
			ws.send(JSON.stringify({
				type : "goto",
				id   : t
			}));
			ws.room = rooms[t];
			console.log(rooms)
			
			sendallexcept(ws.id, JSON.stringify({
				type      : "make",
				data 	  : [
					ws.room.id,
					ws.room.gamemode.id,
					data.roomname,
					ws.name,
					0,
					[],
					false
				]
			}));
			// not a missing break;
			
		case "join":
			sendallexcept(ws.id, JSON.stringify({
				type: "join",
				id  : ws.room
			}));
			break;

		default:
			break;
			
	}

};
