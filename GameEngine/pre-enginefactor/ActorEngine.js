

function doAction(act, actor){
	targetX = actor.x
	targetY = actor.y
	targetZ = actor.z
	switch(actor.dir){
		case 0: break;
		case 1: targetY++;break; 
		case 2: targetX--;break;
		case 3: targetY--;break;
		case 4: targetX++;break;
	}
	switch(act[0]){
		case "Fire":
			targetX = targetX+((actor.x-targetX)*3)
			targetY = targetY+((actor.y-targetY)*3)
			spawnFlame(targetX,targetY)
			break;
		
	}
	
}

function doMove(dir, actor){
	var newX = actor.x
	var newY = actor.y
	var newZ = actor.z
	
	switch(dir[0]){
		
	case "Up":
		if(boundaryCheck(actor.x,actor.y-1, actor.z)){
			if(collisionCheck(actor.x,actor.y-1, actor.z,actor)){
				oldY = actor.y
				actor.y--;
				transposeAtom(actor.x,oldY,actor.z,actor)
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(actor.x, map[0].length, actor.z)){
					if(collisionCheck(actor.x, map[0].length, actor.z,actor)){
						oldY = actor.y
						actor.y=map[0].length-1;
						transposeAtom(actor.x,oldY,actor.z,actor)
					}
				}
			}
		}		
		actor.dir = 1
		break;
	case "Down":
		if(boundaryCheck(actor.x,actor.y+1, actor.z) ){
			if( collisionCheck(actor.x,actor.y+1, actor.z,actor)){
				oldY = actor.y
				actor.y++;
				transposeAtom(actor.x,oldY,actor.z,actor)
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(actor.x, 0, actor.z)){
					if(collisionCheck(actor.x, 0, actor.z,actor)){
						oldY = actor.y
						actor.y = 0;
						transposeAtom(actor.x,oldY,actor.z,actor)
					}
				}
			}
		}
		actor.dir = 3
		break;
	case "Left":
		if(boundaryCheck(actor.x-1,actor.y, actor.z)){
			if( collisionCheck(actor.x-1,actor.y, actor.z,actor)){
				oldX = actor.x
				actor.x--;
				transposeAtom(oldX,actor.y,actor.z,actor)
			}
			else{
				
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(map.length-1, actor.y, actor.z)){
					if(collisionCheck(map.length-1, actor.y, actor.z,actor)){
						oldX = actor.x
						actor.x=map.length-1;
						transposeAtom(oldX,actor.y,actor.z,actor)
					}
				}
			}
		}
		actor.dir = 4
		break;
	case "Right":
		if(boundaryCheck(actor.x+1,actor.y, actor.z)){
			if(collisionCheck(actor.x+1,actor.y, actor.z,actor)){
				oldX = actor.x
				actor.x++;
				transposeAtom(oldX,actor.y,actor.z,actor)
			}
		}
		else{
			if(wrap){
				if(boundaryCheck(0, actor.y, actor.z)){
					if(collisionCheck(0, actor.y, actor.z,actor)){
						oldX = actor.x
						actor.x=0;
						transposeAtom(oldX,actor.y,actor.z,actor)
					}
				}
			}
		}
		actor.dir = 2
		break;	
	}
}
