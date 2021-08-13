let socket = new WebSocket('wss://sollysdream.ddns.net/bomb');
socket.onopen = () => {

};
socket.onmessage = (msg) => {
	msg = JSON.parse(msg.data);
	console.log(msg);
	switch (msg.type) {

		case "init":
			for (let i = 0; i < msg.players.length; i += 2) {
				addplayer(msg.players[i], msg.players[i + 1]);	
			}
			renderplayers();
			break;

		case "join":
			addplayer(msg.id, msg.name);
			renderplayers();
			break;

		case "leave":
			delete players[msg.id]

		default:	
			break;
		
	}
};

let bomb, left;


let player = document.createElement("div");
player.className = "player";

let players = {};
function addplayer(id, name) {
	players[id] = {
		name: name,
		elem: player.cloneNode()
	};;
	bomb.appendChild(players[id].elem)
}

function renderplayers() {

	let it = 360 / players.length;
	let dir = 0;
	console.log(players);
	Object.keys(players).forEach((i) => {
		console.log(dir, i);

		players[i].elem.style = `margin-left:${Math.sin(dir*0.01745329)*20-2.5}vh;margin-top:${Math.cos(dir*0.01745329)*20-2.5}vh;`;
		players[i].elem.innerHTML = i.name;
		
		dir += it;
	});
	
}


window.onload = () => {

	bomb = document.getElementById("bomb");
	
	console.log(bomb);

};
