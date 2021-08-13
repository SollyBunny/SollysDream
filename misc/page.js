let file, mime, cookie; module.exports = (page) => { switch (page) {

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
		file = "./page/index/play.html";
		mime = "text/html";
		cookie = true;
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

	case "/furriesonly":
		file = "./page/reggie.mp4";
		mime = "video/mp4";
		cookie = false;
		break;

	case "/robots.txt":
		return ["", undefined, false];

	default:
		return ["404 Page Not Found", undefined, false];
	
} return [file, mime, cookie]; }
