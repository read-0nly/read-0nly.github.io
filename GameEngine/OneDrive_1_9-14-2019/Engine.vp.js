
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
		if(actor.canMove){
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
}
class JSGEmapEngine{
	//Set the scale factor and initiate the draw loop
	constructor(){		
		
	}
    getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }
	distanceCheck(focuspt,x,y){
		return new Array((x-focuspt.x),(y-focuspt.y))
	}
	loadMap(map){
		this.map = map
		this.self = this
		tileMap.WScale = tileMap.Width * scale;
		tileMap.HScale = tileMap.Height * scale;
		tileMap.canvasHeight= tileMap.HScale * viewportHeight;
		tileMap.canvasWidth = tileMap.WScale * viewportWidth;
		c.width = tileMap.canvasWidth;
		c.height = tileMap.canvasHeight;
		this.mapHalfH = (tileMap.HScale)/2
		this.mapHalfW = (tileMap.WScale)/2
		this.transformW = ((c.width)/2)
		this.transformH = ((c.height)/2)
		ctx.translate(this.transformW-this.mapHalfW,this.transformH-this.mapHalfH)
	}
	//First step of drawing a frame - pull the rows and draw each row
	startDraw(){
		this.drawLoop = setInterval(this.drawMap, drawDelay, this.self);
	}
	pauseDraw(){
		clearInterval(this.drawLoop)
	}
	drawMap(self){
		var i = 0;
		actorEngine.actorStatus=""
		while(i<self.map.length){
			if((typeof self.map[i]) != "undefined" && self.map[i] != null ){
				self.drawRow(self.map[i], i);
			}
			i++;
		}
		i=0
		while(i<actorEngine.actors.length){			
			if(actorEngine.actors[i].getActorInfo != null){
				actorEngine.actorStatus +=actorEngine.actors[i].getActorInfo()
			}
			if(actorEngine.actors[i].tryTick != null){
				actorEngine.actors[i].tryTick()
			}
			i++
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
				var curTile = tileMap.namedTiles[colArr[i].tile]
				var curDistance
				var curX = tileMap.HScale * rowIndex
				var curY = tileMap.WScale * colIndex
				if(actorEngine.player != null){
					curDistance = this.distanceCheck(actorEngine.player, rowIndex, colIndex)
					curX = tileMap.HScale * curDistance[0]
					curY = tileMap.WScale * curDistance[1]					
				}
				if((Math.abs(curX/tileMap.HScale)<(viewportWidth/2))&&(Math.abs(curY/tileMap.WScale)<(viewportHeight/2))){
					this.drawTile(curTile, curX, curY)
				}
				if(colArr[i].getClass!=null){
					if((typeof colArr[i].doMapTick) != "undefined"){
						colArr[i].doMapTick(rowIndex,colIndex)
					}
					if(colArr[i].getClass() == "Player"){
						this.writeDebug(colArr[i].lastKey) 
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
						if(this.map[x][y][z+1] != null){
							if(this.map[x][y][z+1].collisionAction != null){
								this.map[x][y][z+1].collisionAction(x,y,z,actor)
							}
						}
						return true;					
					}
					else{
						actor.collisionAction(x,y,z,this.map[x][y][z])
						if(this.map[x][y][z].health < 0){
							this.map[x][y][z].deathAction()
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
		this.maxHealth = health;
		this.mana = 100;
		this.maxMana = this.mana;
		this.damageModifier = damageModifier;
		this.baseDamage = baseDamage;
		this.collisionLayers.push("Actor");
		this.tick = tick
		this.tickCycle= 0;
		this.inventory = new Array();
		this.canMove = true;
		this.canInfo = true;
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
					actorEngine.doMove(new Array("Up"),this)
					break;
				case 2:
					actorEngine.doMove(new Array("Right"),this)					
					break;	
				case 3:
					actorEngine.doMove(new Array("Down"),this)					
					break;
				case 4:
					actorEngine.doMove(new Array("Left"),this)					
					break;
			}
			return true;
		}
		else{
			return false
		}
	}
	initAuto(self){
		//self.tickCycle = setInterval(self.tickAction, self.tick, self);
	}
	tryTick(){
		this.tickCycle++
		if(this.tickCycle > (this.tick/drawDelay)){
			this.tickAction(this)
			this.tickCycle = 0
		}
	}
	collisionAction(ColX, ColY, ColZ, ColActor){
		var actorClass = ColActor.getClass()
		var selfClass = this.getClass()
		console.log(selfClass + " collided with " + actorClass)
		if(!this.pickup(ColActor)&&ColActor.takeDamage!=null){
			ColActor.takeDamage(this.baseDamage)			
		}
	}
	takeDamage(damage){
		this.health += 0-(damage*this.damageModifier)
		if(this.health<0){
			this.deathAction()
		}
		if(this.health>this.maxHealth){
			this.health=this.maxHealth
		}
	}
	takeManaDamage(damage){
		this.mana += 0-(damage*this.damageModifier)
		if(this.mana<0){
			this.mana=0
		}
		if(this.mana>this.maxMana){
			this.mana=this.maxMana
		}
	}
	tickAction(self){		
		console.log ((self.getClass())+" Ticked")
	}
	fireAction(x,y){
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
		if(this.canInfo==true){
			return "["+this.getClass()+"]<br>Health:"+Math.floor(this.health)+" - Dir:"+this.dir+" - Mana:"+Math.floor(this.mana)+"<br><br>"
		}
		else{
			return ""
		}
	}
}
class Player extends Actor{

	//Base type for a player - also binds keyset
	constructor(x,y,z,dir,tile,collisionLayers,health,damageModifier,keys,baseDamage){
		super(x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage,1000)
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

