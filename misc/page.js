const wss      = require("../modules/wss.js");
const gamemode = require("../modules/gamemode.js");

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
		return [JSON.stringify(gamemode._gamemode), undefined, false];
		break;

	case "/game":
		if (query && gamemode[query]) {
			return [gamemode[query].client, undefined, false];
		}
		return [undefined, 404, false];

	/*case "/game/0":
		file = "./page/game/tictactoe.html";
		mime = "text/html";
		cookie = false;
		break;

	case "/game/1":
		file = "./page/game/bomb.html";
		mime = "text/html";
		cookie = false;
		break;*/

	/*case "/furriesonly":
		file = "./page/reggie.mp4";
		mime = "video/mp4";
		cookie = false;
		break;*/

	case "/rickroll":
	case "/notarickroll":
		return ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", 307, true];

	case "/git":
	case "/github":
		return ["https://github.com/SollyBunny/SollysDream", 307, true];

	case "/robots.txt":
		return ["", undefined, false];

	default:
		return [undefined, 404, false];
	
} return [file, mime, cookie]; }
