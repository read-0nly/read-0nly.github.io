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
	}
	initAuto(self){
		self.interval = setInterval(self.tickAction, self.tick, self);
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
		destroyAtom(this.x,this.y,this.z,this)
		console.log ((this.getClass())+" Died")
	}
	getActorInfo(){		
		return "<table class='actorStats'><tr><td colspan=2>["+this.getClass()+"]</td></tr><tr><td>Health:"+this.health+"</td><td>Dir:"+this.dir+"</td></tr></table>"
	}
}
class Player extends Actor{

	//Base type for a player - also binds keyset
	constructor(x,y,z,dir,tile,collisionLayers,health,damageModifier,keys,baseDamage){
		super(x,y,z,dir,tile,collisionLayers,health,damageModifier, baseDamage,-1)
		this.collisionLayers.push("Player")
		this.keys = keys
		this.lastKey=new Array("null",0)
	}
	collisionAction(ColX, ColY, ColZ, ColActor){
		var actorClass = ColActor.getClass()
		var selfClass = this.getClass()
		console.log(selfClass + " collided with " + actorClass)
		ColActor.health+= (0-this.baseDamage)*ColActor.damageModifier
	}
	deathAction(){
		destroyAtom(this.x,this.y,this.z,this)
		this.x=-1;
		this.y=-1;
		this.z=-1;
		console.log ((this.getClass())+" Died")
	}
	
	check(e) {
		player.lastKey = keys[e.keyCode];
		if(player.keys[e.keyCode][1]=="PlayerMovement"){
			doMove(player.keys[e.keyCode], player)
		}
		if(player.keys[e.keyCode][1]=="PlayerAction"){
			doAction(player.keys[e.keyCode], player)
		}
	}
}

