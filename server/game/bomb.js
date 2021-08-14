let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

function sendallexcept(ws, msg) {
	ws.room.players.forEach((m) => {
		console.log(m)
		if (m !== ws.id) {
			clients[m].send(msg);
		}
	});
}

module.exports.onconnect = (ws) => {

	

};

module.exports.start = (ws) => {
	ws.room.data = {
		turn: 0,
	};
	ws.room.players.forEach((i, m) => {
		clients[i].data = {
			id   : m,
			lives: 3
		}	
	});
	clients[ws.room.players[ws.room.data.turn]].send(JSON.stringify({
		type: "gamestart"
	}));
}

module.exports.ondisconnect = (ws) => {

};

module.exports.onmessage = (ws, data) => {

	switch (data.type) {

		case "gameattempt":
			if (ws.data.id !== ws.room.data.turn) {
				return;
			}
			ws.room.data.turn++;
			ws.room.data.turn %= ws.room.players.length;
			sendallexcept(ws, JSON.stringify({
				type: "gamepress",
				data: data.msg
			}));
			break;
			
		default:
			break;
			
	}

};
