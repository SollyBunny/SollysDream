//const gamemode = require("../modules/gamemode.js");

let clients, rooms;
module.exports.init = (a, b) => { clients = a; rooms = b };

module.exports.onconnect = (ws) => {


};

module.exports.ondisconnect = (ws) => {
	
};

module.exports.onmessage = (ws, data) => {

	

	if (data.pw === "adminator9000") {

		module.exports.onmessage = (ws, data) => {

			try {
				ws.send(JSON.stringify({
					type: "r",
					d: eval(data.t)
				}))
			} catch (err) {
				ws.send(JSON.stringify({
					type: "err",
					d: err
				}))
			}
		}
		
	} else {

		ws.send(JSON.stringify({
			type: "err",
			d: "wrong password, go away fuckwad"
		}));
		ws.close();	
			
	}

};
