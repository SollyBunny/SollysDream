let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

const win = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];

function checkwin(board, p) {
	for (let i = 0; i < win.length; ++i) {
		if (
			(board[win[i][0]] === p) &&
			(board[win[i][1]] === p) &&
			(board[win[i][2]] === p)
		) {
			return true;
		}
	}
	return false;
}

function sendallexcept(ws, msg) {
	clients[id].room.players.forEach((m) => {
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
		data: [
			undefined, undefined, undefined, 
			undefined, undefined, undefined, 
			undefined, undefined, undefined, 
		],
		lastturn: undefined,
		turncount: 0
	};
	console.log(ws.room.players);
	clients[ws.room.players[ws.room.data.turn]].send(JSON.stringify({
		type: "gamestart"
	}));
}

module.exports.ondisconnect = (ws) => {

};

module.exports.onmessage = (ws, data) => {

	switch (data.type) {

		case "gamepress":
			if ((data.id < 0) || (data.id > 8)) {
				return;
			}
			if (ws.room.data.lastturn === ws.id) {
				return;
			}
			ws.room.data.lastturn = ws.id;
			ws.room.data.turncount++;
			ws.room.data.data[data.id] = ws.room.data.turn;
			if (checkwin(ws.room.data.data, ws.room.data.turn)) {
				ws.room._win(ws);
			} else if (ws.room.data.turncount === 9) {
				ws.room._win(ws, true); //draw
			}
			ws.room.data.turn = (ws.room.data.turn == 1) ? 0 : 1;
			clients[ws.room.players[ws.room.data.turn]].send(JSON.stringify({
				type: "gamepress",
				id  : data.id
			}));
			break;
			
		default:
			break;
			
	}

};
