var x = 0;
var y = 0;
var scale = 1;
var drawLoop = null;
var wrap = true;
debugElem=document.getElementById("debug");
var tileMap = {
	Width:30,
	Height:30,
	WScale:0,
	HScale:0,
	img : document.getElementById("tileset"),
	namedTiles : {
		"_" : new Array(0,0),
		"c" : new Array(30,0),
		"i": new Array(60,0),
		"b": new Array(90,0),
	}
};
var player = {
	x: 1,
	y: 1,
	z: 1,
	dir: 0,
	sprite: "i",
	fireAction: function(){},
	boundaryAction: function(BoundX, BoundY){},
	collisionAction: function(ColX, ColY, ColActor){},
	jumpAction: function(newZ){},
	moveAction: function(moveDir){}
	
}
var enemy = {
	x: 0,
	y: 0,
	z: 1,
	dir: 0,
	sprite: "c",
	boundaryAction: function(BoundX, BoundY){},
	collisionAction: function(ColX, ColY, ColActor){},
	jumpAction: function(newZ){},
	moveAction: function(moveDir){}
}
var actors= new Array();
actors.push(player);
actors.push(enemy);
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
var mapLayers = new Array(24,24,3,
"________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________",
"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ",
"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ",);
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");