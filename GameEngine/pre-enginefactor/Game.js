
//It's nice to be able to enumerate by type as well, so lets make some helper objects for that
rays = new Array()
walls = new Array()
floors = new Array()

//Create player and add to list of actors
player = new Player(1,1,1,3,"player",null,100,1,keys,10)
actors.push(player)
actors.push(new Actor(8,8,1,3,"enemy",null,100,1,10))

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

class Flame extends Actor{
	//Base type for a player - also binds keyset
	constructor(x,y,health,damageModifier,baseDamage,tick){
		super(x,y,2,3,"flame",null,health,damageModifier, baseDamage,tick)
		this.collisionLayers.push("Flame")
	}
	tickAction(self){
		var i = 0;
		var stack = map[self.x][self.y];
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

function spawnFlame(x, y){	
	spawnAtom(x,y,2, (new Flame(x,y,100,1,30,500)))
	map[x][y][2].initAuto(map[x][y][2]);
}

function initGame(){
	initEngine(mapAutoGen())	
	window.addEventListener('keyup',player.check,false);
}





//Demo map generator
function mapAutoGen(){	
var mapWidth = 10;
var mapHeight= 10;
var mapDepth = 3;
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
				while (l < actors.length){					
					if(i == actors[l].x && j == actors[l].y && k==1){
						actorFound = actors[l]
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