/*
	This file is a wrapper for /misc/words.txt
	It contains 479k english words delimated by new lines
	This just reads it and provides basic functions
*/

"use strict";

const fs = require("fs");

const file = "/home/solly/Documents/Webserver/misc/words.txt";

module.exports = fs.readFileSync(file).toString('utf-8').split("\n"); 
