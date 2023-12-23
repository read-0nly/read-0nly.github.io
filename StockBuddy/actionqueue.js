class ActionQueue{
	static queue=[]
	static fireQueue(){
		if(ActionQueue.queue.length>0){
			var nextItem  = ActionQueue.queue.shift();
			if(nextItem instanceof Function){
				nextItem();
			}
			else{
				console.log(nextItem);
			}
			
			setTimeout(fireQueue, 500);
		}
	}
}