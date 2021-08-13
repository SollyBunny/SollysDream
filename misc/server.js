module.exports = (page) => {switch (page) {

	case "/rooms":
		return "../server/index/rooms.js";

	case "/admin":
		return "../server/admin.js";

	case 0: // Tic Tac Toe
		return "../server/games/tictactoe.js";

	default:
		return undefined;
	
}}
