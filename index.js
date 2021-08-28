"use strict";

const https = require("./modules/https.js").server;
https.listen(443);
console.log("HTTPS Started");

const wss = require("./modules/wss.js").server;
wss(https);
console.log("WSS Started");

const gamemode = require("./modules/gamemode.js");
gamemode.loadall();
console.log("Gamemodes loaded");
