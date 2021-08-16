let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

const check = (/[a-zA-Z]/);
const words = require("../../modules/words.js");
const subs  = [
	"XY",
	"ELL",
	"MOL",
	"ERS",
	"ALO",
	"NDE",
	"IO",
	"SP",
	"ENG",
	"NGL",
	"PTI",
	"CTI",
	"OTE",
	"RO",
	"ER",
	"ING",
	"IS",
	"AR",
	"MP",
	"ORA",
	"LU",
	"AMM",
	"ANG",
	"OP",
	"OPT",
	"UF",
	"ALE",
	"CO",
	"INS",
	"CAN",
	"RD",
	"IPP",
	"APE",
	"IT",
	"NC",
	"TI",
	"ACO",
	"ME",
	"NIN",
	"LA",
	"TS",
	"ON",
	"POR",
	"RA",
	"OID",
	"CK",
	"NT",
	"RAT",
	"IF",
];
function randsub() {
	return subs[Math.floor(Math.random() * subs.length)]
}

function sendallexcept(ws, msg) {
	ws.room.players.forEach((m) => {
		console.log(m)
		if (m !== ws.id) {
			clients[m].send(msg);
		}
	});
}

function timeout(id) {
	
}

module.exports.onconnect = (ws) => {

	

};

module.exports.start = (ws) => {
	ws.room.data = {
		turn: 0,
		str : randsub()
	};
	ws.room.players.forEach((i, m) => {
		clients[i].data = {
			id   : m,
			lives: 1, //TODO
			type : ""
		}	
	});
	ws.room.players.forEach((m, i) => {
		clients[m].send(JSON.stringify({
			type: "gameinit",
			turn: ws.room.players[ws.room.data.turn],
			str : ws.room.data.str
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

			if (!((check.test(data.letter)) && (data.letter.length === 1)))
			data.letter = data.letter.toUpperCase();
			
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

		case "gametypedel":
			if (ws.data.id !== ws.room.data.turn) {
				return;
			}

			ws.data.type = ws.data.type.slice(0, -1);
			ws.room.players.forEach((m) => {
				if (m !== ws.id) {
					clients[m].send(JSON.stringify({
						type: "gametypedel",
						id  : ws.id
					}));
				}
			})

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
			
			let succsess = (ws.data.type.includes(ws.room.data.str) && words.includes(ws.data.type));
			if (succsess) {
			
				ws.room.data.turn++;
				ws.room.data.turn %= ws.room.players.length;

				ws.room.data.str = randsub();

			}
			
			
			ws.data.type = "";
			ws.room.players.forEach((m) => {
				if (m !== ws.id) {
					clients[m].send(JSON.stringify({
						type: "gameattempt",
						id  : ws.id,
						turn: (succsess ? ws.room.players[ws.room.data.turn] : undefined), // leave undefined too not change turn
						str : ws.room.data.str
					}));
				}
			});
			ws.send(JSON.stringify({
				type: "gameattemptresponce",
				turn: (succsess ? ws.room.players[ws.room.data.turn] : undefined), // leave undefined too not change turn
				str : ws.room.data.str
			}));
			break;
			
		default:
			break;
			
	}

};
