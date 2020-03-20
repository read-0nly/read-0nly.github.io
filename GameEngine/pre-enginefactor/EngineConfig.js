//DOM references
debugElem=document.getElementById("debugInfo");
actorElem=document.getElementById("actorInfo");
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

//Base Parameters
var scale = 1;
var drawDelay = 50;
var wrap = true;

//Define the array that will hold the current map
map = new Array()

//TileMap definition (how do we chop up the image into separate tiles?)
var tileMap = {
	Width:30,
	Height:30,
	WScale:0,
	HScale:0,
	img : document.getElementById("tileset"),
	namedTiles : {
		"floor" : new Array(0,0),
		"wall" : new Array(30,0),
		"enemy": new Array(30,30),
		"player": new Array(60,30),
		"flame": new Array(120,0),
	}
};

//Define the default keyset (keycode: action, actiontype)
var keys = {
	/*
	[<-37][A-38][>-39][V-40]
	[space-32][ctrl-17][shift-16][alt-18]
	[z-90][x-88][c-67]
	[a-65][s-83][d-68]
	[q-81][w-87][e-69]
	[del-46][end-35][pgdwn-34]
	[ins-45][home-36][pgup-33]
	*/
	38:new Array("Up", "PlayerMovement"),
	40:new Array("Down", "PlayerMovement"),
	37:new Array("Left", "PlayerMovement"),
	39:new Array("Right", "PlayerMovement"),
	32:new Array("Jump", "PlayerMovement"),
	46:new Array("Fire", "PlayerAction"),
	45:new Array("Menu", "UIAction"),
}

//Initiate the engine - create the automap (as a demo) then initiate the Map Engine to start the draw loop
function initEngine(loadedMap){
	map = loadedMap
	initMapEngine(map)
}

function writeDebug(msg){
	debugElem.innerHTML = msg
}
function writeActor(msg){
	actorElem.innerHTML = msg
}