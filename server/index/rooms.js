const gamemode = require("../..//modules/gamemode.js");

let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

module.exports.players = [];

function _win(ws, draw) {
	ws.room.players.forEach((i) => {
		clients[i].send(JSON.stringify({
			type: "gamewin",
			id  : draw ? 0 : ws.id
		}))	
	});
	ws.room.playing = false;
}

function _destroy(ws) {
	require("../../server/index/rooms.js").players.forEach((m) => {
		clients[m].send(JSON.stringify({
			type: "delete",
			id  : ws.room.id
		}));
	});	
	console.log(ws.id);
	ws.room.players.forEach((i) => { //kick everyone
		console.log("i: ", i)
		if (i !== ws.id) {
			clients[i].send(JSON.stringify({ // this is just wserror but its used only here so ... im putting it in manually
				type: "err",
				msg: "Invalid room ID"
			}))
			clients[i].close();
		}
		delete clients[ws.id];
	});
	delete rooms[ws.room.id];
}

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
			let tid = new Date().getTime();
			let tgm = gamemode[data.gamemode];
			rooms[tid] = {
				id          : tid,
				gamemode    : tgm,
				roomname    : data.roomname,
				owner       : undefined, // we dont know their final id so just leave empty for now
				players     : [], // list of ids referneced to clients[id]
				playing     : false,
				data        : {},
				_win        : _win,
				_destroy    : _destroy
			};
			ws.send(JSON.stringify({
				type : "goto",
				id   : tid
			}));
			//ws.room = rooms[t];
			//console.log(rooms)
			
			sendallexcept(ws.id, JSON.stringify({
				type      : "make",
				data 	  : [
					tid,
					tgm.id,
					data.roomname,
					ws.name,
					0,
					[],
					false
				]
			}));
			/*sendallexcept(ws.id, JSON.stringify({
				type: "join",
				id  : ws.room.id
			}));*/
			break;
			
		case "join":
			sendallexcept(ws.id, JSON.stringify({
				type: "join",
				id  : ws.room.id
			}));
			break;

		default:
			break;
			
	}

};
