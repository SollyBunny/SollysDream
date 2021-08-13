"use strict";

const http = require("https");
const fs   = require("fs");
const url  = require("url");

/* 
	When page.js gets updated in fs, reload it 
	Defines global var "page", a function which takes a url and returns the appropriate filename & mimetype to serve to the user
*/
var page = require("../misc/page.js");
fs.watchFile("./misc/page.js", (e) => {
	delete require.cache[require.resolve("../misc/page.js")]
	page = require("../misc/page.js");
	console.log("Reloaded page.js");
});


module.exports = http.createServer({
	// Keys required for https, made by certbot (ty)
	key  : fs.readFileSync("/etc/letsencrypt/live/sollysdream.ddns.net/privkey.pem"),
	cert : fs.readFileSync("/etc/letsencrypt/live/sollysdream.ddns.net/cert.pem"),
}, (req, res) => {

	// parse url
	let parsed = url.parse(req.url);
	// parsed.pathname = /abc
	// parsed.query    = id=abc
	
	// get filename & mimetype
	// pass cookie aswell so that we can check if the user has a name (if it doesnt we need to redirect them)
	let [filename, mime, cookie] = page(parsed.pathname);


	// if the page wants the user to have a cookie but there is none redirect it to the login page with a redirect query so we can redirect back to what they where doing
	if (cookie === true && req.headers.cookie === undefined) {
		req.url = "/login?redirect=" + encodeURIComponent(req.url);
		res.writeHead(307, {
			"Location": req.url
		});
		res.end();
		console.log("HTTPS IP:", req.connection.remoteAddress, "Url:", req.url, "(307)");
		return;
	}
	
	// if mimetype == undefined, the url wasn't found (ie 404)
	// (also used to provide plain text responces, like for robots.txt which is empty)
	if (mime == undefined) {
		res.end(filename);
		console.log("HTTPS IP:", req.connection.remoteAddress, "Url:", req.url, "(404)");
		return;
	}
	console.log("HTTPS IP:", req.connection.remoteAddress, "Url:", req.url, "Cookie:", req.headers.cookie);

	// Read and then serve file to the user
	fs.readFile(filename, (err, data) => {
		if (err) { res.end("Failed to read file!"); }
		res.writeHead(200, {
			"Content-Type": mime
		});
		res.end(data);
	});
	
});
