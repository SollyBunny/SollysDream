/*
	This file is a wrapper for /misc/words.txt
	It contains 479k english words delimated by new lines
	This just reads it and provides basic functions
*/

"use strict";

const fs = require("fs");

module.exports.words = fs.readFileSync("/home/solly/Documents/Webserver/misc/words.txt").toString('utf-8').split("\n"); 
module.exports.subs = fs.readFileSync("/home/solly/Documents/Webserver/misc/subs.txt").toString('utf-8').split("\n"); 

//module.exports.words.push("ABCDEGHIJKLMNOPQRSTUV");
//module.exports.subs = [ "A" ];
