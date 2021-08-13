"use strict";

let cos = Math.cos;
let sin = Math.sin;

let keys = {};

let renderX = 50;
let renderY = 50;
let renderS = renderX * renderY;
let renderArray = new Uint8ClampedArray(renderS * 4);

let rayData = {r: 0, g: 0, b: 0};
let rayX = 0;
let rayY = 0;
let rayZ = 0;
let rayRotX = 0;
let rayRotY = 0;
let rayStep = 0;
let rayMaxStep = 100;

let playerDir = 0;
let playerX = 0;
let playerZ = 0;
let playerY = 0;
let playerSpeed = 5;

let fovX = 70;
let fovY = 70;


let world = {};
function worldGen(x, y, z) {
	return Math.random() > 0.99;
}
function worldGet(x, y, z) {
	if (world[x + "," + y + "," + z]) {
		return world[x + "," + y + "," + z];
	} else {
		return world[x + "," + y + "," + z] = worldGen(x, y, z);
	}
}

let lasttime = 0;
let clock = 0;
function tick(time) {


	// calculate difference of each frame in ms
	clock = time - lasttime;
	lasttime = time;
	//console.log(clock);

	ctx.fillRect(0, 0, 10, 10);


	// movemnet
	if (keys["a"]) {
		playerDir -= clock;
	} else if (keys["d"]) {
		playerDir -= clock;
	}

	if (keys["w"]) {
		playerX += cos(playerDir) * playerSpeed * clock
		playerZ += sin(playerDir) * playerSpeed * clock
	} else if (keys["s"]) {
		playerX -= cos(playerDir) * playerSpeed * clock
		playerZ -= sin(playerDir) * playerSpeed * clock
	}


	// ray tracing
	let pos = 0;
	for (let y = 0; y < renderY; ++y) {
		for (let x = 0; x < renderX; ++x) {

			// get data from ya know ray tracing n stuff

			// init values

			rayX = playerX;
			rayY = playerY;
			rayZ = playerZ;

			rayData.r = 0;
			rayData.g = 0;
			rayData.b = 255; // sky color idk

			// work out angle which ray will be sent out
			rayRotX = (x / renderX) * fovX + playerX;
			rayRotY = (y / renderY) * fovY + playerY;

			// send out a ray // rip my brain cell
			for (let rayStep = 0; rayStep < rayMaxStep; ++rayStep) {
				// step for rayRotX
				rayX += cos(rayRotX);
				rayZ += sin(rayRotX);
				// step for rayRotY
				rayX += cos(rayRotY);
				rayY += sin(rayRotY);

				if (worldGet(rayX, rayY, rayZ)) {
					rayData.r = 255 - rayStep;
					break;
				}

				if (rayData.b != 0) {
					rayData.b--;
				}
			}

			// put data into array
			renderArray[pos    ] = rayData.r;
			renderArray[pos + 1] = rayData.g;
			renderArray[pos + 2] = rayData.b;
			renderArray[pos + 3] = 255;

			pos += 4;
		}
	}

	// convert ray tracing array into imagedata and render to can
	ctx.putImageData(
		new ImageData(renderArray, renderX, renderY),
		0, 0
	);

	window.requestAnimationFrame(tick);
};


let can = document.getElementById("can");
let ctx = can.getContext("2d");


window.onkeydown = (e) => {
	keys[e.key] = true;
};
window.onkeyup = (e) => {
	keys[e.key] = false;
};

window.requestAnimationFrame(tick);