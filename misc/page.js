const wss = require("../modules/wss.js");

let file, mime, cookie; module.exports = (page, query) => { switch (page) {

	case "/admin":
		file = "./page/admin.html";
		mime = "text/html";
		cookie = false;
		break;

	case "/":
	case "/index":
	case "/login":
		file = "./page/index/index.html";
		mime = "text/html";
		cookie = false;
		break;
		
	case "/rooms":
		file = "./page/index/rooms.html";
		mime = "text/html";
		cookie = true;
		break;

	case "/play":
		if (query) {

			// first check if room exists
			if (!(query in wss.rooms)) {
				return ["/rooms", 307, true];
			}
			// check if room is full
			if (wss.rooms[query].players.length === wss.rooms[query].gamemode.maxplayers) {
				return ["/rooms", 307, true];
			}
			// check if room is playing
			if (wss.rooms[query].playing) {
				return ["/rooms", 307, true];
			}

			file = "./page/index/play.html";
			mime = "text/html";
			cookie = true;
			
		} else {
			return ["/rooms", 307, true];
		}
		
		break;

	case "/gamemode.json":
		file = "./misc/gamemode.json";
		mime = "text/json";
		cookie = false;
		break;

	case "/game/0":
		file = "./page/game/tictactoe.html";
		mime = "text/html";
		cookie = false;
		break;

	/*case "/furriesonly":
		file = "./page/reggie.mp4";
		mime = "video/mp4";
		cookie = false;
		break;*/

	case "/robots.txt":
		return ["", undefined, false];

	default:
		return ["404 Page Not Found", undefined, false];
	
} return [file, mime, cookie]; }
