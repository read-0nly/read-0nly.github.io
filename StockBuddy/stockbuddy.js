
var App = {
	init : function() {
		Quagga.init(this.state, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			App.attachListeners();
			App.checkCapabilities();
			Quagga.start();
		});
	},
	stop:false,
	checkCapabilities: function() {
		var track = Quagga.CameraAccess.getActiveTrack();
		var capabilities = {};
		if (typeof track.getCapabilities === 'function') {
			capabilities = track.getCapabilities();
		}
		this.applySettingsVisibility('zoom', capabilities.zoom);
		this.applySettingsVisibility('torch', capabilities.torch);
	},
	updateOptionsForMediaRange: function(node, range) {
		console.log('updateOptionsForMediaRange', node, range);
		var NUM_STEPS = 6;
		var stepSize = (range.max - range.min) / NUM_STEPS;
		var option;
		var value;
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
		for (var i = 0; i <= NUM_STEPS; i++) {
			value = range.min + (stepSize * i);
			option = document.createElement('option');
			option.value = value;
			option.innerHTML = value;
			node.appendChild(option);
		}
	},
	applySettingsVisibility: function(setting, capability) {
		// depending on type of capability
		if (typeof capability === 'boolean') {
			var node = document.querySelector('input[name="settings_' + setting + '"]');
			if (node) {
				node.parentNode.style.display = capability ? 'block' : 'none';
			}
			return;
		}
		if (window.MediaSettingsRange && capability instanceof window.MediaSettingsRange) {
			var node = document.querySelector('select[name="settings_' + setting + '"]');
			if (node) {
				this.updateOptionsForMediaRange(node, capability);
				node.parentNode.style.display = 'block';
			}
			return;
		}
	},
	initCameraSelection: function(){
		var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

		return Quagga.CameraAccess.enumerateVideoDevices()
		.then(function(devices) {
			function pruneText(text) {
				return text.length > 30 ? text.substr(0, 30) : text;
			}
			var $deviceSelection = document.getElementById("deviceSelection");
			while ($deviceSelection.firstChild) {
				$deviceSelection.removeChild($deviceSelection.firstChild);
			}
			devices.forEach(function(device) {
				var $option = document.createElement("option");
				$option.value = device.deviceId || device.id;
				$option.appendChild(document.createTextNode(pruneText(device.label || device.deviceId || device.id)));
				$option.selected = streamLabel === device.label;
				$deviceSelection.appendChild($option);
			});
		});
	},
	attachListeners: function() {
		var self = this;

		self.initCameraSelection();
		$(".controls").on("click", "button.stop", function(e) {
			$("#interactive.viewport > video").css("display", "none");
			App.stop=true;
		});
		$(".controls").on("click", "button.start", function(e) {
			$("#interactive.viewport > video").css("display", "default");
			App.stop=false;
			$('select[name="decoder_readers"]')
			.val('upc')
			.trigger('change');
			
		});

		$(".controls .reader-config-group").on("change", "input, select", function(e) {
			e.preventDefault();
			var $target = $(e.target),
				value = $target.attr("type") === "checkbox" ? $target.prop("checked") : $target.val(),
				name = $target.attr("name"),
				state = self._convertNameToState(name);

			console.log("Value of "+ state + " changed to " + value);
			self.setState(state, value);
		});
	},
	_accessByPath: function(obj, path, val) {
		var parts = path.split('.'),
			depth = parts.length,
			setter = (typeof val !== "undefined") ? true : false;

		return parts.reduce(function(o, key, i) {
			if (setter && (i + 1) === depth) {
				if (typeof o[key] === "object" && typeof val === "object") {
					Object.assign(o[key], val);
				} else {
					o[key] = val;
				}
			}
			return key in o ? o[key] : {};
		}, obj);
	},
	_convertNameToState: function(name) {
		return name.replace("_", ".").split("-").reduce(function(result, value) {
			return result + value.charAt(0).toUpperCase() + value.substring(1);
		});
	},
	detachListeners: function() {
		$(".controls").off("click", "button.stop");
		$(".controls .reader-config-group").off("change", "input, select");
	},
	applySetting: function(setting, value) {
		var track = Quagga.CameraAccess.getActiveTrack();
		if (track && typeof track.getCapabilities === 'function') {
			switch (setting) {
			case 'zoom':
				return track.applyConstraints({advanced: [{zoom: parseFloat(value)}]});
			case 'torch':
				return track.applyConstraints({advanced: [{torch: !!value}]});
			}
		}
	},
	setState: function(path, value) {
		var self = this;

		if (typeof self._accessByPath(self.inputMapper, path) === "function") {
			value = self._accessByPath(self.inputMapper, path)(value);
		}

		if (path.startsWith('settings.')) {
			var setting = path.substring(9);
			return self.applySetting(setting, value);
		}
		self._accessByPath(self.state, path, value);

		console.log(JSON.stringify(self.state));
		App.detachListeners();
		Quagga.stop();
		App.init();
	},
	inputMapper: {
		inputStream: {
			constraints: function(value){
				if (/^(\d+)x(\d+)$/.test(value)) {
					var values = value.split('x');
					return {
						width: {min: parseInt(values[0])},
						height: {min: parseInt(values[1])}
					};
				}
				return {
					deviceId: value
				};
			}
		},
		numOfWorkers: function(value) {
			return parseInt(value);
		},
		decoder: {
			readers: function(value) {
				if (value === 'ean_extended') {
					return [{
						format: "ean_reader",
						config: {
							supplements: [
								'ean_5_reader', 'ean_2_reader'
							]
						}
					}];
				}
				return [{
					format: value + "_reader",
					config: {}
				}];
			}
		}
	},
	state: {
		inputStream: {
			type : "LiveStream",
			constraints: {
				width: {min: 640},
				height: {min: 480},
				aspectRatio: {min: 1, max: 100},
				facingMode: "environment" // or user
			}
		},
		locator: {
			patchSize: "medium",
			halfSample: true
		},
		numOfWorkers: 2,
		frequency: 10,
		decoder: {
			readers : [{
				format: "upc_reader",
				config: {}
			}]
		},
		locate: true
	},
	lastResult : null
};

App.init();

Quagga.onProcessed(function(result) {
	var drawingCtx = Quagga.canvas.ctx.overlay,
		drawingCanvas = Quagga.canvas.dom.overlay;

	if (result) {
		if (result.boxes) {
			drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
			result.boxes.filter(function (box) {
				return box !== result.box;
			}).forEach(function (box) {
				Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
			});
		}

		if (result.box) {
			Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
		}

		if (result.codeResult && result.codeResult.code) {
			Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
		}
	}
	if(App.stop){
			$("#interactive.viewport > video").css("display", "none");
			Quagga.stop(); 
	}
});

Quagga.onDetected(function(result) {
	var code = result.codeResult.code;

	if (App.lastResult !== code) {
		App.lastResult = code;
		var $node = null, canvas = Quagga.canvas.dom.image;

		$node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
		$node.find("img").attr("src", canvas.toDataURL());
		$node.find("h4.code").html(code);
		$("#result_strip ul.thumbnails").prepend($node);
	}
});

class UPCValidation{
	code="";
	found=false;
	volatileUPC = null
	static jsonparser=["code","found"]
	static DB = [];
	constructor(code, found=false,note="",promo="",image=""){
		this.volatileUPC=UPC.fetch(code,note,promo,image);
		this.code=code;
		UPCValidation.DB.push(this);
		
	}
	static fetch(code, found=null,note="",promo="",image=""){
		var target=UPCValidation.search(code);
		if(target==null){			
			target=new UPCValidation(code)
				console.log("upcvalidfoundnew");
		}
		if(found!=null){
			target.found=found;
		}
		if(note!=""){
			console.log("Overwrite '"+target.volatileUPC.note+"' with  '"+note+"'")
			target.volatileUPC.note=note;
		}
		if(promo!=""){
			target.volatileUPC.promo=promo;
		}
		if(image!=""){
			target.volatileUPC.image=image;
		}
		return target;		
		
	}
	toNode(){
		if(this.volatileUPC==null){
			this.volatileUPC=UPC.search(code)
		}
		if(this.volatileUPC==null){
			return null
		}
		this.node = this.volatileUPC.toNode();
		if(this.found){
			this.node.find(".info-upc").attr("validated","");
		}
		return this.node;
	}
	static search(code){
		var found =  false;
		var  result=null;
		Array.from(UPCValidation.DB).forEach((upcvalid)=>{
			if(upcvalid.code==code){
				if(upcvalid.volatileUPC==null){
					var index = UPCValidation.DB.indexOf(upcvalid);
					var x = UPCValidation.DB.splice(index, upcvalid);
				}
				else{
					found=true;
					console.log("upcvalidfound");
					result= upcvalid;
					
				}
				
			}
			
		});
		return result;
		
	}
}
class UPC{
	code=""
	note=""
	promo=""
	image=""
	static jsonparser=["code","note","promo","image"]
	static DB = [];
	scannedcount=-1;
	/*
	
	<tr><td>
		<div class="info info-lookup" onclick="UPCClick.call(this)">&#128269;</div>
		<div class="info info-upc">000055554212<div class="info info-sale">2/2.50</div></div>
		<div class="info info-controls"><div class="info info-deleteUpc">[Delete] </div><div class="info info-editNote">[Edit] </div> </div>
		<div class="info info-note">jhdasfjhgasdf kjlhgdsf </div>
	</td></tr>
	*/
	constructor(code){
			this.code=code;
			UPC.DB.push(this);
	}
	static fetch(code,note="",promo="",image=""){
		var target = UPC.search(code);
		if(target==null){
			target=new UPC(code,note,promo,image);
		}
		if(note!=""){
			console.log("Overwrite '"+target.note+"' with  '"+note+"'")
			target.note=note;
		}
		if(promo!=""){
			target.promo=promo;
		}
		if(image!=""){
			target.image=image;
		}
		return target;
	}
	static click()
	{
	   var func = this.getAttribute('function');
	   var upc = this.parentNode.getAttribute('upc');
	}
	toNode(){
		this.node = $(`		
		<tr><td upc="`+this.code+`">
			<div class="info info-lookup" onclick="UPC.click.call(this)" function="lookup">&#128269;</div>
			<div class="info info-upc">
				`+this.code+`
				<div class="info info-sale" onclick="UPC.click.call(this)" function="promo">`+this.promo+`</div>
			</div>
			<div class="info info-controls">
				<div class="info info-deleteUpc" onclick="UPC.click.call(this)" function="delete">[Delete] </div>
				<div class="info info-editNote" onclick="UPC.click.call(this)" function="edit">[Edit] </div> 
			</div>
			<div class="info info-note">`+this.note+`</div>
		</td></tr>
		`);		
		return this.node;
	}
	
	toString(){
		return code;
	}
	static sortByCode(){
		var bucket  = null;
		var sorted = true;
		DB.forEach((code) => {
			
		});
	}
	static sortByCount(){
		var bucket  = null;
		var sorted = true;
		do{
			for(i=0;i<DB.length-1;i++){
				if(DB[i].scannedcount<DB[i+1].scannedcount){
					sorted=false;
					bucket =DB[i];
					DB[i]=DB[i+1];
					DB[i+1]=bucket;
					bucket=null;
				}
			}
		}while(!sorted)
	}
	static sort=UPC.sortByCount;
	static search(code){
		var found=false;
		UPC.DB.forEach((upc)=>{
			if(upc.code==code){
				console.log("found");
				found=true;
				return upc;
			}
			
		});
		if(!found){
			console.log("notfound");
			return null;
		}
	}
}

class UPCDB  {
	static codebank = []
	static current  = []
	
}


//debugging
var upcval = UPCValidation.fetch("555444321",true,"Test note","2/6.66");
upcval = UPCValidation.fetch("555444321",null,"t2");
$("#stockvalidator-table").empty();
$("#stockvalidator-table").append(upcval.toNode());

//Bootstrap

addEventListener("load", (event) => {
	$('select[name="decoder_readers"]')
	.val('upc')
	.trigger('change');
	App.stop=true;
	});
	
$(window).blur(function(){
	App.stop=true;
});
