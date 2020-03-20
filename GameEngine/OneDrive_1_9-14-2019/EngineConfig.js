/*///////PLANNING//////////
//
//
// 4 spells - earth air fire water
// 
// water extinguishes fire, captures occupant
// fire consumes air, burns occupants
// air moves earth and actors, direction chosen by random if even, max if odd
// earth blocks a tile, lifts occupant
//
// langton-ant the enemies, with a shared floor. Player direction applies color change
//
//
/////////PLANNING////////*/


//Classes
//Base Atom is meant to be generic as all hell. As such, extended classes for tile types and item types shouldn't be defined there. The Engine Config is meant to sit on top of the mapengine and atom to create the rest of the game logic from those parts.

class Floor extends Tile{
	constructor(x,y){
		super(x,y,0,0,"floor",null)
		this.collisionLayers.push("Floor")
	}	
}
class Wall extends Tile{
	constructor(x,y){
		super(x,y,1,0,"wall",null)
	}	
}
class Wand extends Item{
	constructor(x,y, f){
		super(x,y,1,1,"wand",null,1)
		this.flag=f
		
	}
	
}
class Slime extends Actor{
	constructor(x,y,z,dir,tick){
		super(x,y,z,dir,"slime",new Array(),60,0.8,20,(tick*0.8))
		this.collisionLayers.push("Slime");
		this.oldColAct = this.collisionAction
		this.collisionAction=this.newCollisionAction
		this.recovery = 0.9
	}
	newCollisionAction(ColX,ColY,ColZ,ColActor){
		this.oldColAct(ColX,ColY,ColZ,ColActor)
		if(!this.pickup(ColActor)&&ColActor.takeDamage!=null){
			this.takeDamage(0-this.baseDamage*this.recovery)			
		}
		
	}
}
class FireWand extends Wand{
	
	constructor(x,y){
		super(x,y,2)
	}
	fireAction(actor, mana,x, y){
		var newX = x;
		var newY = y;
		/* switch(actor.dir){
			case 1:
				newY--;
				newY--;
				break;
			case 2:
				newX++;
				newX++;
				break;
			case 3:
				newY++;
				newY++;
				break;
			case 4:
				newX--;
				newX--;
				break;
		}		 */
		mapEngine.spawnAtom(newX,newY,2,fireField)
		drawLifeTile(newX,newY,fieldMap,this.flag)
	}
	dropAction(actor){
		this.x=actor.x;
		this.y=actor.y;
		spawnAtom(actor.x,actor.y,actor.z, this)
	}
}
class WaterWand extends Wand{
	
	constructor(x,y){
		super(x,y,1)
	}
	fireAction(actor, mana,x,y){
		var newX = x;
		var newY = y;
		/* switch(actor.dir){
			case 1:
				newY--;
				newY--;
				break;
			case 2:
				newX++;
				newX++;
				break;
			case 3:
				newY++;
				newY++;
				break;
			case 4:
				newX--;
				newX--;
				break;
		}		 */
		mapEngine.spawnAtom(newX,newY,2,fireField)
		drawLifeTile(newX,newY,fieldMap,this.flag)
	}
	dropAction(actor){
		this.x=actor.x;
		this.y=actor.y;
		spawnAtom(actor.x,actor.y,actor.z, this)
	}
}
class EarthWand extends Wand{
	
	constructor(x,y){
		super(x,y,8)
	}
	fireAction(actor, mana,x,y){
		var newX = x;
		var newY = y;
		mapEngine.spawnAtom(newX,newY,2,fireField)
		drawLifeTile(newX,newY,fieldMap,this.flag)
	}
	dropAction(actor){
		this.x=actor.x;
		this.y=actor.y;
		spawnAtom(actor.x,actor.y,actor.z, this)
	}
}
class AirWand extends Wand{
	
	constructor(x,y){
		super(x,y,4)
	}
	fireAction(actor, mana,x,y){
		var newX = x;
		var newY = y;
		mapEngine.spawnAtom(newX,newY,2,fireField)
		drawLifeTile(newX,newY,fieldMap,this.flag)
	}
	dropAction(actor){
		this.x=actor.x;
		this.y=actor.y;
		spawnAtom(actor.x,actor.y,actor.z, this)
	}
}
class LifeEntity extends Actor{
	//The base type for items (can be picked up and used, moves between inventory and gameworld)
	constructor(tile){
		//x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage, tick
		super(-1,-1,2,1,tile,null,9999999,0,10,1000)
		this.collisionLayers.push("LifeEntity")
		this.canInfo=false;
		this.canMove=false;
	}
	doMapTick(i,j){
		lifeDamageTickDelay++;
		lifeTickCount++;
		if((lifeDamageTickDelay / lifeDamageTickTime) > 1){
			lifeDamageTickDelay = 1;
			if(mapEngine.map[i][j][1]!= null){
				this.doMagic(mapEngine.map[i][j][1])
			}			
		}		
	}
	tryTick(){		
		lifeTickCount++;
		if((lifeTickCount > (lifeSpeed/drawDelay))){
			lifeDraw()
			lifeTickCount = 0
		}
	}
	doMagic(actor){		
		console.log(this.getClass()+" ticked at "+i+" : "+j+" on obj "+actor.getClass())
	}
	collisionAction(x,y,z,actor){
		this.doMagic(actor)
	}
}
class EarthField extends LifeEntity{
	//The base type for items (can be picked up and used, moves between inventory and gameworld)
	constructor(){
		//x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage, tick
		super("earth")
		this.flag = 8;
	}
	doMagic(actor){
		
		if(actor!= null){
			if(actor.canMove != null){
				actor.canMove = false
			}	
		}
	}
}
class AirField extends LifeEntity{
	//The base type for items (can be picked up and used, moves between inventory and gameworld)
	constructor(){
		//x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage, tick
		super("air")
		this.flag = 4;
	}
	doMagic(actor){		
		if(actor!= null){
			if(actor.canMove != null){
				switch(getRdm(0,4)){
					case 0:	actorEngine.doMove(new Array("Up"), actor); break;
					case 1:	actorEngine.doMove(new Array("Down"), actor); break;
					case 2:	actorEngine.doMove(new Array("Left"), actor); break;
					case 3:	actorEngine.doMove(new Array("Right"), actor); break;
				}
			}	
		}
	}
	
}
class FireField extends LifeEntity{
	//The base type for items (can be picked up and used, moves between inventory and gameworld)
	constructor(){
		//x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage, tick
		super("fire")
		this.flag = 2;
	}
	doMagic(actor){		
		if((typeof actor.health) == "number"){
			console.log(actor.health + "health")
			actor.takeDamage(100*lifeDamageTickFactor)
		}				
	}
}
class WaterField extends LifeEntity{
	//The base type for items (can be picked up and used, moves between inventory and gameworld)
	constructor(){
		//x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage, tick
		super("water")
		this.flag = 1;
	}
	doMagic(actor){		
		if((typeof actor.health) == "number"){
			console.log(actor.health + "health")
			actor.takeDamage(-5*lifeDamageTickFactor)
			actor.takeManaDamage(-10*lifeDamageTickFactor)
		}				
	}
}

//It's nice to be able to enumerate by type as well, so lets make some helper objects for that
var rays = new Array()
var walls = new Array()
var floors = new Array()
//UI current Card
var currentCard = "";
//DOM references
var debugElem=document.getElementById("debugInfo");
var actorElem=document.getElementById("actorInfo");
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
//Player and field maps
var player = null;
var fieldMap = new Array()
var fireField = new FireField()
var waterField = new WaterField()
var earthField = new EarthField()
var airField = new AirField()
//Base Parameters
var scale = 1;
var drawDelay = 50;
var wrap = true;
var mapWidth = 40;
var mapHeight= 40;
var viewportHeight=25;
var viewportWidth=25;
var mapDepth = 3;
var dirVariance = 1;
var minEnemies = 10;
var maxEnemies = 20;
var enemyTickSpeed = 1000;
var lifeDamageTickTime = 11;
var lifeDamageTickFactor = 0.1
var lifeSpeed = 10000;
var lifeSpeedH = 10000;
var lifeSpeedStep = 5;
var lifeSpeedL = 10;
var lifeTickCount = 0;
var lifeDamageTickDelay = 1;
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
		"earth" : new Array(60,0),
		"air" : new Array(90,0),
		"fire" : new Array(120,0),
		"water" : new Array(150,0),
		"slime": new Array(30,30),
		"player": new Array(60,30),
		"pointer": new Array(80,0)
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
	34:new Array("NextItem", "UIAction"),
	33:new Array("PrevItem", "UIAction"),
	45:new Array("Select", "UIAction"),
	16:new Array("Mod1", "Modifier",0),
	17:new Array("Mod2", "Modifier",0),
	18:new Array("Mod3", "Modifier",0),
	
}
	
window.addEventListener('keyup',checkUp,false);
window.addEventListener('keyup',checkDown,false);
c.addEventListener('mousemove', function(evt) {
	mapEngine.mousePos = mapEngine.getMousePos(c, evt);
	
}, false);	  
c.addEventListener('click', function(e) {
	var normalX = (mapEngine.mousePos.x - tileMap.canvasWidth/2)
	var normalY = (mapEngine.mousePos.y - tileMap.canvasHeight/2)
	var normalPercentX = normalX/(tileMap.canvasWidth/2)
	var normalPercentY = normalY/(tileMap.canvasHeight/2)
	var spellX = Math.floor(normalPercentX*(viewportWidth/2)+0.5)+actorEngine.player.x
	var spellY = Math.floor(normalPercentY*(viewportHeight/2)+0.5)+actorEngine.player.y	
	actorEngine.player.fireAction(spellX,spellY)
	
}, 0);
function checkUp(e) {
	actorEngine.player.lastKey = keys[e.keyCode];
	console.log(e.keyCode+" Pressed")
	if(actorEngine.player.keys[e.keyCode][1]=="PlayerMovement"){
		actorEngine.doMove(actorEngine.player.keys[e.keyCode], actorEngine.player)
	}
	if(actorEngine.player.keys[e.keyCode][1]=="PlayerAction"){
		if(actorEngine.player.keys[e.keyCode][0]=="Fire"){
			var p = actorEngine.player
			var newX = actor.x;
			var newY = actor.y;
			switch(actor.dir){
				case 1:
					newY--;
					newY--;
					break;
				case 2:
					newX++;
					newX++;
					break;
				case 3:
					newY++;
					newY++;
					break;
				case 4:
					newX--;
					newX--;
					break;
			}		

			p.fireAction(newX,newY);
		}
		else{
			actorEngine.doAction(actorEngine.player.keys[e.keyCode], actorEngine.player)
		}
	}
	if(actorEngine.player.keys[e.keyCode][1]=="UIAction"){
		switch(actorEngine.player.keys[e.keyCode][0]){
			case "NextItem":
				actorEngine.player.inventory.push(actorEngine.player.inventory.shift())
				break;
			case "PrevItem":
				actorEngine.player.inventory.unshift(actorEngine.player.inventory.pop())
				break;
		}
	}
}
function checkDown(e) {
	actorEngine.player.lastKey = actorEngine.player.keys[e.keyCode];
	if(actorEngine.player.keys[e.keyCode][1]=="Modifier"){
		//actorEngine.doMove(actorEngine.player.keys[e.keyCode], actorEngine.player)
	}
	if(actorEngine.player.keys[e.keyCode][1]=="PlayerAction"){
		//actorEngine.doAction(actorEngine.player.keys[e.keyCode], actorEngine.player)
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

function lifeTick(){
	var i= 0;
	lifeSpeed = lifeSpeedH
	var newMap = new Array();
	var pattern = new Array(
		new Array(-1,-1),
		new Array(-1,0),
		new Array(-1,1),
		new Array(0,-1),
		new Array(0,1),
		new Array(1,-1),
		new Array(1,0),
		new Array(1,1)
	)
	while (i<fieldMap.length){
		var j = 0;
		newMap.push(new Array())
		while(j<fieldMap[i].length){
			var earthNb = 0;
			var airNb = 0;
			var fireNb = 0;
			var waterNb = 0;
			var k = 0;
			newMap[i].push(0);
			while(k < pattern.length){
				if(fieldMap[i+pattern[k][0]] != null){
					earthNb += (fieldMap[i+pattern[k][0]][j+pattern[k][1]] == 8)
					airNb += (fieldMap[i+pattern[k][0]][j+pattern[k][1]] == 4)
					fireNb += (fieldMap[i+pattern[k][0]][j+pattern[k][1]] == 2)
					waterNb += (fieldMap[i+pattern[k][0]][j+pattern[k][1]] == 1)
				}
				k++
			}			
			if(mapEngine.map[i][j][1]!= null){
				if(mapEngine.map[i][j][1].canMove != null){
					mapEngine.map[i][j][1].canMove = true
				}	
			}
			breedCell(newMap, 1, i, j, waterNb, 2,8);
			breedCell(newMap, 2, i, j, fireNb, 4,1);		
			breedCell(newMap, 4, i, j, airNb, 8,2);
			breedCell(newMap, 8, i, j, earthNb, 1,4);	
			if(newMap[i][j]==-1){
				newMap[i][j]=0
			}
			j++
		}
		i++
	}
	return newMap
}
function breedCell(newMap, flag,i,j,nb,negation,negator){	
		if(mapEngine.map[i][j][1]!==null){
			if(mapEngine.map[i][j][1].getClass() == "Wall"){
				newMap[i][j] = -1
			}
		}
		if(fieldMap[i][j] == flag){
			switch(nb){
				case 2:
				case 3:
					if((newMap[i][j] == negation || newMap[i][j] == 0)){
						
						newMap[i][j] = flag
						lifeSpeed = lifeSpeed - lifeSpeedStep
						if(lifeSpeed<lifeSpeedL){
							lifeSpeed = lifeSpeedL
						}
					}
					else{
						newMap[i][j] = -1
					}
					break;
				default:
			}
		}
		else if (fieldMap[i][j] == 0 || fieldMap[i][j] == null){				
			switch(nb){
				case 3:
					if(newMap[i][j] == negation || newMap[i][j] == 0){
						newMap[i][j] = flag
						lifeSpeed = lifeSpeed - lifeSpeedStep
						if(lifeSpeed<lifeSpeedL){
							lifeSpeed = lifeSpeedL
						}
					}
					else if(newMap[i][j] != negator){
						newMap[i][j] = -1
						
					}
					break;
				default:
			}
		}
	}
function lifeDraw(){
	fieldMap = lifeTick()
	var i = 0;
	while(i<mapEngine.map.length){
		var j = 0
		while(j<mapEngine.map[i].length){
			switch(fieldMap[i][j]){
			case 8:
				mapEngine.spawnAtom(i,j,2,earthField)
				if(mapEngine.map[i][j][1]!=null){
					mapEngine.map[i][j][2].doMagic(mapEngine.map[i][j][1])
				}
				break;
			case 4:
				mapEngine.spawnAtom(i,j,2,airField)
				if(mapEngine.map[i][j][1]!=null){
					mapEngine.map[i][j][2].doMagic(mapEngine.map[i][j][1])
				}
				break;
			case 2:
				mapEngine.spawnAtom(i,j,2,fireField)
				if(mapEngine.map[i][j][1]!=null){
					mapEngine.map[i][j][2].doMagic(mapEngine.map[i][j][1])
				}
				break;
			case 1:
				mapEngine.spawnAtom(i,j,2,waterField)
				if(mapEngine.map[i][j][1]!=null){
					mapEngine.map[i][j][2].doMagic(mapEngine.map[i][j][1])
				}
				break;
				
			default:
				mapEngine.destroyAtom(i,j,2,earthField)
			}
			j++;
		}
		i++;
	}
}
function lifeInit(){
	var i = 0;
	var mapBucket = new Array();
	while(i<mapWidth){
		var rowBucket = new Array();
		var j = 0;
		while(j<mapHeight){
			rowBucket.push(null)
			j++;
		}	
		mapBucket.push(rowBucket)
		i++;
	}
	fieldMap = mapBucket;
	/*
	drawLifeTile(5,5,fieldMap,1)
	drawLifeTile(5,6,fieldMap,1)	drawLifeTile(5,7,fieldMap,1)
	drawLifeTile(7,6,fieldMap,1)
	drawLifeTile(9,5,fieldMap,1)
	drawLifeTile(9,6,fieldMap,1)
	drawLifeTile(9,7,fieldMap,1)
	
	drawLifeTile(5,9,fieldMap,8)
	drawLifeTile(5,10,fieldMap,8)
	drawLifeTile(5,11,fieldMap,8)
	drawLifeTile(7,10,fieldMap,8)
	drawLifeTile(9,9,fieldMap,8)
	drawLifeTile(9,10,fieldMap,8)
	drawLifeTile(9,11,fieldMap,8)	
	
	drawLifeTile(13,5,fieldMap,2)
	drawLifeTile(13,6,fieldMap,2)
	drawLifeTile(13,7,fieldMap,2)
	drawLifeTile(15,6,fieldMap,2)
	drawLifeTile(17,5,fieldMap,2)
	drawLifeTile(17,6,fieldMap,2)
	drawLifeTile(17,7,fieldMap,2)
	
	drawLifeTile(13,9,fieldMap,4)
	drawLifeTile(13,10,fieldMap,4)
	drawLifeTile(13,11,fieldMap,4)
	drawLifeTile(15,10,fieldMap,4)
	drawLifeTile(17,9,fieldMap,4)
	drawLifeTile(17,10,fieldMap,4)
	drawLifeTile(17,11,fieldMap,4)
	*/
}
function drawLifeTile(i,j,map, type) {
	map[i][j] = type
	switch(map[i][j]){
		case 8:
			mapEngine.spawnAtom(i,j,2,earthField)
			break;
		case 4:
			mapEngine.spawnAtom(i,j,2,airField)
			break;
		case 2:
			mapEngine.spawnAtom(i,j,2,fireField)
			break;
		case 1:
			mapEngine.spawnAtom(i,j,2,waterField)
			break;
			
		default:
			mapEngine.destroyAtom(i,j,2,earthField)
	}
}

function initGame(){
	initEngines()	
	Actor.prototype.fireAction = function fireAction(x,y){
		this.manacost = 1
		if(this.inventory[0]!=null)
			if(typeof this.inventory[0] !="undefined"){
				if(this.mana>this.manacost){
					this.inventory[0].fireAction(this, this.manacost,x,y)
					this.mana=this.mana-this.manacost
				}
			}
			
	}
	//generate Actors
	actorEngine.player = new Player(1,1,1,3,"player",null,100,1,keys,10)
	actorEngine.actors.push(earthField)
	actorEngine.actors.push(fireField)
	actorEngine.actors.push(airField)
	actorEngine.actors.push(waterField)	
	actorEngine.actors.push(actorEngine.player)
	actorEngine.player.mana = 100
	actorEngine.player.inventory.push(new FireWand(-1,-1))
	actorEngine.player.inventory.push(new WaterWand(-1,-1))
	actorEngine.player.inventory.push(new AirWand(-1,-1))
	actorEngine.player.inventory.push(new EarthWand(-1,-1))
	loadLevel(mapAutoGen())
	lifeInit()
	//setInterval(lifeDraw,lifeSpeed)
	mapEngine.startDraw()
	var i = 0
	
	while(i < (getRdm(minEnemies,maxEnemies))){
		var newX = getRdm(1,mapWidth-1);
		var newY = getRdm(1,mapHeight-1);
		if (newX != actorEngine.player.x && newY != actorEngine.player.y){
			var newEnemy = new Slime(newX,newY,1,1,enemyTickSpeed);
			newEnemy.tickAction = AIMove;
			//newEnemy.initAuto(newEnemy);
			actorEngine.enemies.push(newEnemy);
			actorEngine.actors.push(newEnemy);
		}
		else{
			i--;
		}
		i++;
	}
	
	var i = 0;
	while(i<actorEngine.actors.length){
		var p = actorEngine.actors[i];
		mapEngine.spawnAtom(p.x,p.y,p.z,p);
		i++;
	}
}

function getRdm(min, max){
	return (Math.floor(Math.random()*(max-min))+min)
}

function mapAutoGen(){	
var i = 0;
var mapBucket = new Array();
while(i<mapWidth){
	var rowBucket = new Array();
	var j = 0;
	while(j<mapHeight){
		var depthBucket = new Array();
		var k = 0;
		while(k<mapDepth){
			if(k==0){
				depthBucket.push(new Floor(i, j))
			}
			else if((j == 0 || i == 0 || (i==5&&j<20) || (i==10&&j>20)) && k == 1){		
				depthBucket.push(new Wall(i, j))
			}
			else if((j == mapHeight-1 || i == mapWidth-1) && k == 1){
				depthBucket.push(new Wall(i, j))
			}
			else{	
				var l = 0
				var actorFound = null
				while (l < actorEngine.actors.length){					
					if(i == actorEngine.actors[l].x && j == actorEngine.actors[l].y && k==1){
						actorFound = actorEngine.actors[l]
					}	
					l++;
				}
				depthBucket.push(actorFound)
			}
			k++;
		}
		rowBucket.push(depthBucket)
		j++;
	}
	
	mapBucket.push(rowBucket)
	i++;
}
return mapBucket
}

function AIMove(self){
	var targetX = actorEngine.player.x
	var targetY = actorEngine.player.y
	var targetZ = actorEngine.player.z
	var currentX = self.x
	var currentY = self.y
	var currentZ = self.z
	var newDir = new Array();
	if(getRdm(1,10) > dirVariance){
		if(targetZ == currentZ){
			var difX = currentX - targetX
			var difY = currentY - targetY
			if(Math.abs(difX)>Math.abs(difY)){
				if(difX>0){
					newDir.push("Left")
				}
				else if(difX<0){
					newDir.push("Right")
				}
			}
			else{
				if(difY>0){
					newDir.push("Up")
				}
				else if(difY<0){
					newDir.push("Down")
				}			
			}
		}
	}
	else{
		switch(getRdm(1,5)){
			case 1:
				newDir.push("Up")
				break;
			case 2:
				newDir.push("Right")
				break;
			case 3:
				newDir.push("Down")
				break;
			case 4:
				newDir.push("Left")
				break;		
		}
	}
	actorEngine.doMove(newDir, self)
}

function openCard(id){			
	var elem=document.getElementById(id)
	if (elem.style["visibility"]=="collapse" || elem.style["visibility"] == ""){
		if(currentCard !=""){
			openCard(currentCard)
			}
		elem.style["visibility"]='visible'
		currentCard = id
		}
	else{
		currentCard = ""
		elem.style["visibility"]='collapse'
	}
}


