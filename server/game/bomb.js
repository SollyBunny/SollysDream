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
			lives: 3,
			type : ""
		}	
	});
	ws.room.players.forEach((m, i) => {
		clients[m].send(JSON.stringify({
			type: "gameinit",
			start: ws.room.players[ws.room.data.turn]
		}))	;
	});
	
}

module.exports.ondisconnect = (ws) => {

};

module.exports.onmessage = (ws, data) => {

	switch (data.type) {

		case "gametype":
			if (ws.data.id !== ws.room.data.turn) {
				return;
			}
			//TODO character check
			ws.data.type += data.letter;
			ws.room.players.forEach((m) => {
				if (m !== ws.id) {
					clients[m].send(JSON.stringify({
						type: "gametype",
						id  : ws.id,
						letter: data.letter
					}));
				}
			});
			break;

		case "gameattempt":
			if (ws.data.id !== ws.room.data.turn) {
				return;
			}
			/*
			;
		;
			ws.room.players.forEach((m) => {
				console.log(m)
				if (m !== ws.id) {
					clients[m].send(JSON.stringify({
						type: "gamepress",
						data: data.msg,
						turn: ws.room.data.turn === clients[i].dataid
					}));
				}
			});*/
			let succsess = true //TODO
			if (succsess) {
				ws.room.data.turn++;
				ws.room.data.turn %= ws.room.players.length;
			}
			
			
			ws.data.type = "";
			ws.room.players.forEach((m) => {
				if (m !== ws.id) {
					clients[m].send(JSON.stringify({
						type: "gameattempt",
						id  : ws.id,
						turn: succsess ? ws.room.players[ws.room.data.turn] : undefined// leave undefined too not change turn
					}));
				}
			});
			ws.send(JSON.stringify({
				type: "gameattemptresponce",
				id: succsess ? ws.room.players[ws.room.data.turn] : undefined// leave undefined too not change turn
			}));
			break;
			
		default:
			break;
			
	}

};
