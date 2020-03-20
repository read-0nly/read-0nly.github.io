
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////// CORE ENGINE CODE BEYOND THIS POINT DANGER DANGER MR BOBINSON //////////////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////	CORE ENGINE CLASS DEFINITIONS	/////
class JSGEactorEngine{
	constructor(){
		this.player = null;
		this.actors = new Array()
		this.friendlies = new Array()
		this.enemies = new Array()
		this.actorStatus = ""
	}
	doAction(act, actor){
		var targetX = actor.x
		var targetY = actor.y
		var targetZ = actor.z
		switch(actor.dir){
			case 0: break;
			case 1: targetY++;break; 
			case 2: targetX--;break;
			case 3: targetY--;break;
			case 4: targetX++;break;
		}
		switch(act[0]){
			case "Fire":
				actor.fireAction();
				break;
			
		}
		
	}
	doMove(dir, actor){
		var oldX = actor.x
		var oldY = actor.y
		var oldZ = actor.z
		
		switch(dir[0]){
			
		case "Up":
			if(mapEngine.boundaryCheck(actor.x,actor.y-1, actor.z)){
				if(mapEngine.collisionCheck(actor.x,actor.y-1, actor.z,actor)){
					oldY = actor.y
					actor.y--;
					mapEngine.transposeAtom(actor.x,oldY,actor.z,actor)
				}
			}
			else{
				if(wrap){
					if(mapEngine.boundaryCheck(actor.x, mapEngine.map[0].length, actor.z)){
						if(mapEngine.collisionCheck(actor.x, mapEngine.map[0].length, actor.z,actor)){
							oldY = actor.y
							actor.y=mapEngine.map[0].length-1;
							mapEngine.transposeAtom(actor.x,oldY,actor.z,actor)
						}
					}
				}
			}		
			actor.dir = 1
			break;
		case "Down":
			if(mapEngine.boundaryCheck(actor.x,actor.y+1, actor.z) ){
				if(mapEngine.collisionCheck(actor.x,actor.y+1, actor.z,actor)){
					oldY = actor.y
					actor.y++;
					mapEngine.transposeAtom(actor.x,oldY,actor.z,actor)
				}
			}
			else{
				if(wrap){
					if(mapEngine.boundaryCheck(actor.x, 0, actor.z)){
						if(mapEngine.collisionCheck(actor.x, 0, actor.z,actor)){
							oldY = actor.y
							actor.y = 0;
							mapEngine.transposeAtom(actor.x,oldY,actor.z,actor)
						}
					}
				}
			}
			actor.dir = 3
			break;
		case "Left":
			if(mapEngine.boundaryCheck(actor.x-1,actor.y, actor.z)){
				if( mapEngine.collisionCheck(actor.x-1,actor.y, actor.z,actor)){
					oldX = actor.x
					actor.x--;
					mapEngine.transposeAtom(oldX,actor.y,actor.z,actor)
				}
				else{
					
				}
			}
			else{
				if(wrap){
					if(mapEngine.boundaryCheck(mapEngine.map.length-1, actor.y, actor.z)){
						if(mapEngine.collisionCheck(mapEngine.map.length-1, actor.y, actor.z,actor)){
							oldX = actor.x
							actor.x=mapEngine.map.length-1;
							mapEngine.transposeAtom(oldX,actor.y,actor.z,actor)
						}
					}
				}
			}
			actor.dir = 4
			break;
		case "Right":
			if(mapEngine.boundaryCheck(actor.x+1,actor.y, actor.z)){
				if(mapEngine.collisionCheck(actor.x+1,actor.y, actor.z,actor)){
					oldX = actor.x
					actor.x++;
					mapEngine.transposeAtom(oldX,actor.y,actor.z,actor)
				}
			}
			else{
				if(wrap){
					if(mapEngine.boundaryCheck(0, actor.y, actor.z)){
						if(mapEngine.collisionCheck(0, actor.y, actor.z,actor)){
							oldX = actor.x
							actor.x=0;
							mapEngine.transposeAtom(oldX,actor.y,actor.z,actor)
						}
					}
				}
			}
			actor.dir = 2
			break;	
		}
	}
}
class JSGEmapEngine{
	//Set the scale factor and initiate the draw loop
	constructor(){	
		
	}
	loadMap(map){
		this.map = map
		this.self = this
		tileMap.WScale = tileMap.Width * scale;
		tileMap.HScale = tileMap.Height * scale;
		tileMap.canvasHeight= tileMap.Height * map[0].length;
		tileMap.canvasWidth = tileMap.Width * map.length;
		c.width = tileMap.canvasWidth;
		c.height = tileMap.canvasHeight;
		this.mapHalfH = (tileMap.Height * map[0].length)/2
		this.mapHalfW = (tileMap.Width * map.length)/2
		this.transformW = ((c.width)/2)-this.mapHalfW
		this.transformH = ((c.height)/2)-this.mapHalfH
		ctx.translate(this.transformH,this.transformW)
		this.drawLoop = setInterval(this.drawMap, drawDelay, this.self);
	}
	//First step of drawing a frame - pull the rows and draw each row
	drawMap(self){
		var i = 0;
		actorEngine.actorStatus=""
		while(i<self.map.length){
			if((typeof self.map[i]) != "undefined" && self.map[i] != null ){
				self.drawRow(self.map[i], i);
			}
			i++;
		}
		mapEngine.writeActor(actorEngine.actorStatus)
	}
	//In each row, pull each stack and draw the stack
	drawRow(rowArr, rowIndex){
		var i = 0;
		while(i<rowArr.length){
			if((typeof rowArr[i]) != "undefined" && rowArr[i] != null ){
				this.drawStack(rowArr[i],i, rowIndex);
				
			}
			i++;
		}
	}
	//in each stack, draw the atoms from lowest to highest
	drawStack(colArr, colIndex, rowIndex){
		var i = 0;
		while(i<colArr.length){
			if((typeof colArr[i]) != "undefined" && colArr[i] != null ){
				this.drawTile(tileMap.namedTiles[colArr[i].tile], tileMap.HScale * rowIndex, tileMap.WScale * colIndex)
				if(colArr[i].getClass!=null){
					if(colArr[i].getClass() == "Player"){
						this.writeDebug(colArr[i].lastKey) 
					}
					if(colArr[i].getActorInfo != null){
						actorEngine.actorStatus += colArr[i].getActorInfo()
					}
				}
			}
			i++;
		}
	}
	//draw the tile associated with the atom at the respective location
	drawTile(tilePoint,x,y){  
	  ctx.drawImage(tileMap.img,tilePoint[0], tilePoint[1],tileMap.Width,tileMap.Height,x,y,tileMap.WScale, tileMap.HScale);
	}
	destroyAtom(x,y,z){
		this.map[x][y][z]=null
	}
	spawnAtom(x,y,z,atom){
		this.map[x][y][z]=atom}
	transposeAtom(x,y,z,atom){
		this.map[x][y][z]=null
		this.map[atom.x][atom.y][atom.z]=atom
	}
	//Check if the target is occupied
	collisionCheck(x,y,z,actor){
		if ((typeof this.map[x]) != "undefined" ){
			if((typeof this.map[x][y]) != "undefined"){
				if((typeof this.map[x][y][z]) != "undefined"){
					if ((this.map[x][y][z]) == null){
						return true;					
					}
					else{
						actor.collisionAction(x,y,z,this.map[x][y][z])
						if(this.map[x][y][z].health < 0){
							this.map[x][y][z].deathAction()
						}
						this.map[x][y][z].collisionAction(actor.x,actor.y,actor.z,actor)
						if(actor.health < 0){
							actor.deathAction()
						}
						return false					
					}
				}
				else{
					return false
				}
			}
			else{
				return false
			}
		}
		else{
			return false
		}
	}
	//check if the target is in bounds
	boundaryCheck(x, y, z){
		if ((typeof this.map[x]) != "undefined" ){
			if((typeof this.map[x][y]) != "undefined"){			
				if((typeof this.map[x][y][z]) != "undefined"){			
					return true;
				}
				else{
					return false
				}
			}
			else{
				return false
			}
		}
		else{
			return false
		}
	}
	writeDebug(msg){
		debugElem.innerHTML = msg
	}
	writeActor(msg){
		actorElem.innerHTML = msg
	}
}


/////	ATOM CLASS DEFINITIONS			/////
class Atom{
	//The base type for any "thing" in the game world
	constructor(x,y,z,dir,tile,collisionLayers){
		this.collisionLayers = new Array();
		this.x = x;
		this.y = y;
		this.z = z;
		this.dir = dir;
		this.tile = tile;	
		this.self = this
		if(collisionLayers == null){
			collisionLayers = new Array()
		}
		this.collisionLayers = collisionLayers;
	}
	boundaryAction(BoundX, BoundY){}
	collisionAction(ColX, ColY, ColZ, ColActor){
		var actorClass = ColActor.getClass()
		var selfClass = this.getClass()
		console.log(selfClass + " collided with " + actorClass)
	}
	getClass(){
		return this.__proto__.constructor.name
	}
}
class Tile extends Atom{
	//The base type for environmental tiles (walls, floors, etc)
	constructor(x,y,z,dir,tile,collisionLayers){
		super(x,y,z,dir,tile,collisionLayers)
		this.collisionLayers.push("Tile")
	}

}
class Item extends Atom{
	//The base type for items (can be picked up and used, moves between inventory and gameworld)
	constructor(x,y,z,dir,tile,collisionLayers,stack){
		super(x,y,z,dir,tile,collisionLayers)
		this.collisionLayers.push("Item")
		this.stack = stack
	}
	fireAction(){}
	pickupAction(){}
}
class Actor extends Atom{
	//Base type for an actor (represents an active entity with related properties like health)
	constructor(x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage, tick){
		super(x,y,z,dir,tile,collisionLayers)
		this.health = health;
		this.damageModifier = damageModifier;
		this.baseDamage = baseDamage;
		this.collisionLayers.push("Actor");
		this.tick = tick
		this.tickCycle= 0;
		this.inventory = new Array();
	}
	pickup(item){
		if(item.collisionLayers.find(function(element) {return element == "Item";}) != null){
			this.inventory.push(item)
			item.pickupAction()
			item.x=-1;
			item.y=-1;
			destroyAtom(item)
			switch(this.dir){
				case 1:
					doMove("Up",this)
					break;
				case 2:
					doMove("Right",this)					
					break;	
				case 3:
					doMove("Down",this)					
					break;
				case 4:
					doMove("Left",this)					
					break;
			}
			return true;
		}
		else{
			return false
		}
	}
	initAuto(self){
		self.tickCycle = setInterval(self.tickAction, self.tick, self);
	}
	collisionAction(ColX, ColY, ColZ, ColActor){
		var actorClass = ColActor.getClass()
		var selfClass = this.getClass()
		console.log(selfClass + " collided with " + actorClass)
		if(!this.pickup(colActor)){
			ColActor.health+= (0-this.baseDamage)*ColActor.damageModifier
		}
	}
	takeDamage(damage){
		this.health += 0-(damage*this.damageModifier)
		if(this.health<0){
			this.deathAction()
		}
	}
	tickAction(self){		
		console.log ((self.getClass())+" Ticked")
	}
	fireAction(){
		console.log ((this.getClass())+" Fired")
	}
	jumpAction(newZ) {
		console.log ((this.getClass())+" Jumped")
	}
	moveAction(moveDir) {
		console.log ((this.getClass())+" Moved")
	}
	deathAction(){
		clearInterval(this.interval)
		
		mapEngine.destroyAtom(this.x,this.y,this.z,this)
		this.x=-1;
		this.y=-1;
		this.z=-1;
		console.log ((this.getClass())+" Died")
	}
	getActorInfo(){		
		return "["+this.getClass()+"]<br>Health:"+this.health+" - Dir:"+this.dir+"<br><br>"
	}
}
class Player extends Actor{

	//Base type for a player - also binds keyset
	constructor(x,y,z,dir,tile,collisionLayers,health,damageModifier,keys,baseDamage){
		super(x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage,-1)
		this.collisionLayers.push("Player")
		this.keys = keys
		this.lastKey=new Array("null",0)
		this.self = this
	}
	deathAction(){
		mapEngine.destroyAtom(this.x,this.y,this.z,this)
		this.x=-1;
		this.y=-1;
		this.z=-1;
		console.log ((this.getClass())+" Died")
	}
}

