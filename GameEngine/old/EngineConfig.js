//DOM references
var debugElem=document.getElementById("debugInfo");
var actorElem=document.getElementById("actorInfo");
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var player

//Base Parameters
var scale = 1;
var drawDelay = 50;
var wrap = true;

//Define the engines
var mapEngine = null
var actorEngine = null

//TileMap definition (how do we chop up the image into separate tiles?)
var tileMap = {
	Width:30,
	Height:30,
	WScale:0,
	HScale:0,
	canvasWidth:0,
	canvasHeight:0,
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
	45:new Array("NextMenu", "UIAction"),
	45:new Array("PrevMenu", "UIAction"),
	45:new Array("NextItem", "UIAction"),
	45:new Array("PrevItem", "UIAction"),
	45:new Array("Select", "UIAction"),
	16:new Array("Mod1", "Modifier",0),
	17:new Array("Mod2", "Modifier",0),
	18:new Array("Mod3", "Modifier",0),
	
}
	
window.addEventListener('keyup',checkUp,false);
window.addEventListener('keyup',checkDown,false);
		
function checkUp(e) {
	actorEngine.player.lastKey = keys[e.keyCode];
	if(actorEngine.player.keys[e.keyCode][1]=="PlayerMovement"){
		actorEngine.doMove(actorEngine.player.keys[e.keyCode], actorEngine.player)
	}
	if(actorEngine.player.keys[e.keyCode][1]=="PlayerAction"){
		if(actorEngine.player.keys[e.keyCode][0]=="Fire"){
			var p = actorEngine.player
			p.spellEnd = (new Date).getTime()
			if(((p.spellEnd-p.spellStart)/100)>100){
				p.spellMana = 100
			}
			else{
				p.spellMana = ((p.spellEnd-p.spellStart)/100)
			}
			if(p.mana-p.spellMana <0){
				p.spellMana = p.mana
			}
			p.mana = p.mana - p.spellMana
			p.fireAction();
			p.spellStart=0;		
			p.spellEnd=0;
			p.spellMana=0;
		}
		else{
			actorEngine.doAction(actorEngine.player.keys[e.keyCode], actorEngine.player)
		}
	}
}

function checkDown(e) {
	actorEngine.player.lastKey = actorEngine.player.keys[e.keyCode];
	if(actorEngine.player.keys[e.keyCode][1]=="Modifier"){
		doMove(actorEngine.player.keys[e.keyCode], actorEngine.player)
	}
	if(actorEngine.player.keys[e.keyCode][1]=="PlayerAction"){
		if(actorEngine.player.keys[e.keyCode][0]=="Fire"){
			actorEngine.player.spellEnd = 0;
			actorEngine.player.spellStart = (new Date).getTime()
		}
	}
}

//Initiate the engine - create the automap (as a demo) then initiate the Map Engine to start the draw loop
function initEngines(){
	actorEngine = new JSGEactorEngine()
	mapEngine = new JSGEmapEngine()
}

function loadLevel(loadedMap){
	mapEngine.loadMap(loadedMap)
}

function flipSection(id){
	elem = document.getElementById(id)
	if (elem.style["display"]=="none"){
		elem.style = 'display:default'
	}
	else{
		elem.style = 'display:none'
	}
}

