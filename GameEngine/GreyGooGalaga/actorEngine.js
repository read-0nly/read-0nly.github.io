function check(e) {
  debugElem.innerHTML = keys[e.keyCode];
  if(keys[e.keyCode][1]=="PlayerMovement"){
		doMove(keys[e.keyCode], player)
	}
  if(keys[e.keyCode][1]=="PlayerAction"){
		doAction(keys[e.keyCode], player)
	}
}

window.addEventListener('keyup',this.check,false);

function doMove(dir, actor){
	switch(dir[0]){
	case "Up":
		if(boundaryCheck(actor.x,actor.y-1)){
			if(collisionCheck(actor.x,actor.y-1)){
				actor.y--;
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(actor.x, mapLayers[1]-1)){
					if(collisionCheck(actor.x, mapLayers[1]-1)){
						actor.y=mapLayers[1]-1;
					}
				}
			}
		}		
		actor.dir = 1
		break;
	case "Down":
		if(boundaryCheck(actor.x,actor.y+1) ){
			if( collisionCheck(actor.x,actor.y+1)){
				actor.y++;
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(actor.x, 0)){
					if(collisionCheck(actor.x, 0)){
						actor.y=0;
					}
				}
			}
		}
		actor.dir = 3
		break;
	case "Left":
		if(boundaryCheck(actor.x-1,actor.y)){
			if( collisionCheck(actor.x-1,actor.y)){
				actor.x--;
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(mapLayers[0]-1, actor.y)){
					if(collisionCheck(mapLayers[0]-1, actor.y)){
						actor.x=mapLayers[0]-1;
					}
				}
			}
		}
		actor.dir = 4
		break;
	case "Right":
		if(boundaryCheck(actor.x+1,actor.y)){
			if(collisionCheck(actor.x+1,actor.y)){
				actor.x++;
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(0, actor.y)){
					if(collisionCheck(0, actor.y)){
						actor.x=0;
					}
				}
			}
		}
		actor.dir = 2
		break;	
	}
}



function destroyActor(actor){
	var lineLen=mapLayers[0]
	var newInd = (lineLen*actor.y)+actor.x;
	mapLayers[4] = mapLayers[4].substring(0, newInd) + " " + mapLayers[4].substring(newInd+1);
}
function mapActor(actor){
	var lineLen=mapLayers[0]
	var newInd = (lineLen*actor.y)+actor.x;
	mapLayers[actor.z+3] = mapLayers[actor.z+3].substring(0, newInd) + actor.sprite + mapLayers[actor.z+3].substring(newInd+1);
}
