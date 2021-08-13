let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

module.exports.maxplayers = 2;

function sendallexcept(id, msg) {
	rooms[clients[id].room].players.forEach((m) => {
		console.log(m)
		if (m !== id) {
			clients[m].send(msg);
		}
	});
}

module.exports.onconnect = (id) => {

	let initdata = new Array(rooms[clients[id].room].players.length * 2 + 4);

	initdata[0] = rooms[clients[id].room].id;
	initdata[1] = rooms[clients[id].room].gametype;
	initdata[2] = rooms[clients[id].room].roomname;
	initdata[3] = rooms[clients[id].room].ownername;
	
	let i = 4;
	rooms[clients[id].room].players.forEach((m) => {
		initdata[i    ] = clients[m].id;
		initdata[i + 1] = clients[m].name;
		i += 2;
	});

	clients[id].send(JSON.stringify({
		type: "init",
		data: initdata
	}));

	sendallexcept(id, JSON.stringify({
		type: "join",
		data: [
			id,
			clients[id].name
		]
	}));

};

module.exports.ondisconnect = (id) => {
	console.log("LEAAVE")
	require("rooms.js").sendall(JSON.stringify({
		type: "leave",
		id  : clients[id].room
	}));
	sendallexcept(id, JSON.stringify({
		type: "leave",
		id  : id
	}));
};

module.exports.onmessage = (id, data) => {

	console.log(data);

	switch (data.type) {

		default:
			break;
			
	}

};
