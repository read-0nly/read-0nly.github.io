/*///////PLANNING//////////


4 spells - earth air fire water

water extinguishes fire, captures occupant
fire consumes air, burns occupants
air moves earth and actors, direction chosen by random if even, max if odd
earth blocks a tile, lifts occupant

langton-ant the enemies, with a shared floor. Player direction applies color change


/////////PLANNING////////*/

//It's nice to be able to enumerate by type as well, so lets make some helper objects for that
rays = new Array()
walls = new Array()
floors = new Array()

var mapWidth = 20;
var mapHeight= 20;
var mapDepth = 3;
var dirVariance = 1;
var minEnemies = 0;
var maxEnemies = 0;
var enemyTickSpeed = 1000;


//UI current Card
var currentCard = "";

//Create player and add to list of actors

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
	constructor(x,y){
		super(x,y,1,1,"wand",null,1)
		
	}
	
}
class FlameWand extends Wand{
	
	constructor(x,y){
		super(x,y)
		
	}
	fireAction(actor, mana){
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
		spawnFlame(newX,newY,mana)
		
	}
	dropAction(actor){
		this.x=actor.x;
		this.y=actor.y;
		spawnAtom(actor.x,actor.y,actor.z, this)
	}
}
class Flame extends Actor{
	//Base type for a player - also binds keyset
	constructor(x,y,health,damageModifier,baseDamage,tick){
		super(x,y,2,3,"flame",null,health,damageModifier, baseDamage,tick)
		this.collisionLayers.push("Flame")
	}
	tickAction(self){
		var i = 0;
		var stack = mapEngine.map[self.x][self.y];
		while(i<stack.length){
			if(stack[i] != null && (typeof stack[i] != "undefined")){
				if((typeof stack[i].takeDamage) == "function"){
					stack[i].takeDamage(self.baseDamage)
				}
			}
			i++;
		}
		var i = 0;
		console.log(self.getClass() + " ticked")
	}
}

function spawnFlame(x, y, power){	
	mapEngine.spawnAtom(x,y,2, (new Flame(x,y,100,1,power,500)))
	mapEngine.map[x][y][2].initAuto(mapEngine.map[x][y][2]);
}

function initGame(){
	initEngines()	
	mapEngine.loadMap(mapAutoGen())
	Actor.prototype.fireAction = function fireAction(){
		if(this.inventory[0]!=null)
			if(typeof this.inventory[0] !="undefined"){
				this.inventory[0].fireAction(this, this.spellMana)
			}
			
	}
	//generate Actors
	actorEngine.player = new Player(1,1,1,3,"player",null,100,1,keys,10)
	actorEngine.actors.push(actorEngine.player)
	actorEngine.player.mana = 10000
	actorEngine.player.inventory.push(new FlameWand(-1,-1))
	var i = 0
	
	while(i < (getRdm(minEnemies,maxEnemies))){
		var newX = getRdm(1,mapWidth-1);
		var newY = getRdm(1,mapHeight-1);
		if (newX != actorEngine.player.x && newY != actorEngine.player.y){
			var newEnemy = new Actor(newX,newY,1,3,"enemy",null,100,1,10,enemyTickSpeed);
			newEnemy.tickAction = AIMove;
			newEnemy.initAuto(newEnemy);
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

//Demo map generator
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
			else if((j == 0 || i == 0) && k == 1){				
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

