"use strict";

const https = require("./modules/https.js");
https.listen(443);
console.log("HTTPS Started");

const wss = require("./modules/wss.js");
wss(https);
console.log("WSS Started");
