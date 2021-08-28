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

//The regex check to see if a username is valid (only contains a-zA-Z0-9_) so that they can't include html elements (arbritrary code execution)
let check = (/^[a-zA-Z0-9_]+$/);

module.exports.server = http.createServer({
	// Keys required for https, made by certbot (ty)
	key  : fs.readFileSync("/etc/letsencrypt/live/sollysdream.ddns.net/privkey.pem"),
	cert : fs.readFileSync("/etc/letsencrypt/live/sollysdream.ddns.net/cert.pem"),
}, (req, res) => {

	// parse url
	let parsed = url.parse(req.url);
	// parsed.pathname = /abc
	// parsed.query    = id=abc
	
	// get filename & mimetype
	// ask if a cookie is needed aswell (name) so we can redirect them to user select page
	// pass in the search term aswell 
	let [filename, mime, cookie] = page(parsed.pathname, parsed.query);


	// if the page wants the user to have a cookie but there is none redirect it to the login page with a redirect query so we can redirect back to what they where doing
	// also check if their username is valid
	if (
		(cookie === true) && (
			(req.headers.cookie === undefined) ||
			(!check.test(req.headers.cookie))
		)
	) {
		req.url = "/login?" + encodeURIComponent(req.url);
		res.writeHead(307, {
			"Location": req.url,
			"Set-Cookie": ";SameSite=Strict" // empty out cookie
		});
		res.end();
		console.log("HTTPS IP:", req.connection.remoteAddress, "Url:", req.url, "(307)");
		return;
	}
	
	// If mime is undefined its text
	if (mime === undefined) {
		res.end(filename);
		console.log("HTTPS IP:", req.connection.remoteAddress, "Url:", req.url, "(text)");
		return;
	}

	// 404 ):
	if (mime === 404) {
		res.end("404 Page Not Found");
		console.log("HTTPS IP:", req.connection.remoteAddress, "Url:", req.url, "(404)");
		return;
	}

	// if mimetype == 307, we want to redirect to the url
	if (mime === 307) {
		res.writeHead(307, {
			"Location": filename
		});
		res.end();
		console.log("HTTPS IP:", req.connection.remoteAddress, "Url:", req.url, "(307)");
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
