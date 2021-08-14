module.exports = (page) => {switch (page) {

	case "/rooms":
		return "../server/index/rooms.js";

	case "/admin":
		return "../server/admin.js";

	case 0: // Tic Tac Toe
		return "../server/game/tictactoe.js";

	case 1: // Bomb
		return "../server/game/bomb.js";

	default:
		return undefined;
	
}}
