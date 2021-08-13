let clients;
module.exports.init = (a) => { clients = a; };

let players = [];

function sendallexcept(id, msg) {
	players.forEach((i) => {
		if (i !== id) {
			clients[i].send(msg);
		}	
	});
}
function sendall(msg) {
	players.forEach((i) => {
		clients[i].send(msg);
	});
}

module.exports.onconnect = (id) => {

	players.push(id);

	let initdata = Array((players.length - 1) * 2);
	players.forEach((m, i) => {
		initdata[i * 2]     = clients[m].id;
		initdata[i * 2 + 1] = clients[m].name;
	});

	sendallexcept(id, JSON.stringify({
		type: "join",
		id: clients[id].id,
		name: clients[id].name
	}));
	clients[id].send(JSON.stringify({
		type: "init",
		players: initdata
	}));
	console.log("hi");
};

module.exports.ondisconnect = (id) => {

	console.log("):p");
	players.splice(players.indexOf(id), 1);
	
}

module.exports.onmessage = (data) => {

	sendallexcept(id, JSON.stringify({
		type: "leave",
		id: clients[id].id
	}));
	
}
