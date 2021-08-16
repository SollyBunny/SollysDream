"use strict";

let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

let oldturn;

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

function turn(ws, aturn, adead) {

	clients[ws.room.players[ws.room.data.turn]].data.type = "";

	if (aturn) {
		oldturn = ws.room.data.turn;
		do {
			ws.room.data.turn++;
			if (ws.room.data.turn === ws.room.players.length) { ws.room.data.turn = 0; }
		} while (ws.room.players[ws.room.data.turn].lives === 0);
		if (ws.room.data.turn === oldturn) { // all but 1 is ded
			ws.room._win(clients[ws.players[ws.room.data.turn]]);
			return;
		}
		clearTimeout(ws.room.data.timeout);
		ws.room.data.timeout = setTimeout(timeout, 10000, clients[ws.room.players[ws.room.data.turn]]);
		if (!adead) {
			ws.room.data.str = randsub();
		}
	}
	ws.room.players.forEach((m) => {
		clients[m].send(JSON.stringify({
			type: "gameattempt",
			id  : ws.id,
			turn: (aturn ? ws.room.players[ws.room.data.turn] : undefined), // leave undefined too not change turn
			str : (((aturn) && (!adead)) ? ws.room.data.str : undefined),
			dead: adead
		}));
	});
	/*ws.send(JSON.stringify({
					type: "gameattemptresponce",
					turn: (succsess ? ws.room.players[ws.room.data.turn] : undefined), // leave undefined too not change turn
					str : ws.room.data.str
				}));*/
}

function timeout(ws) {
	ws.data.lives--;
	console.log(ws.data.lives);
	/*if (ws.data.lives === 0) {
		
	} else {
		
	}*/
	turn(ws, true, true);
	
}

module.exports.onconnect = (ws) => {

	

};

module.exports.start = (ws) => {
	ws.room.data = {
		turn: 0,
		str : randsub(),
		timeout: null
	};
	ws.room.data.timeout = setTimeout(timeout, 10000, clients[ws.room.players[ws.room.data.turn]]);
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

			

			if (ws.data.type.includes(ws.room.data.str) && words.includes(ws.data.type)) {
				turn(ws, true, false);
			} else {
				turn(ws, false, false);
			}
			
			break;
			
		default:
			break;
			
	}

};
