/*		VAR DECLARATION		*///{
	
//Base delimiter
delimiter=","
//Regex vars for the different steps
regexDelim = new RegExp('', 'g')
regexNewline = new RegExp('', 'g')
regexQuotes = new RegExp('', 'g')
regexTrailQuotes = new RegExp('', 'g')
regexPadQuotes =   new RegExp('', 'g')
regexPatchQuotes = new RegExp('', 'g')
regexBadChar = new RegExp('', 'g')
//For loading the csv file
var reader = new FileReader(); 
//File selected by FileReader (so we can reload it)
var file = "";
//Array that holds the array of tasks for the task engine to run
var tasks = []
//Holds the raw content of the CSV
var contents = "";
//DOM objects
var statusEle
var fileContentEle
var fullTableEle
var htmlTranscoder
var delimiterEle
var stringDelimiterEle
var fileInput
var progressDoneEle
var progressStepEle
//Progress Tracking
var progressDone=0;
var progressStep=0;
var progressTotal=100;
var stepFragment=10;
//Pagination
var currentPage = 0;
var pageRowCount = 0;
var pageSize = 1000;
//Flag for whether we want all content or just error rows
var isErr = true;
//Flag for whether we try to strip diacritics/accents or now
var removeDiac = true;


var cellMenu=document.createElement("div");
//}

/*		INIT FUNCTION		*///{

function init(){
	//You're gonna see a lot of this. setTimeout adds the function to the event queue on a millisecond timer.
	//Doing this instead of just diving from one function to the next allows the event loop to update the render.
	//Without the breathing room provided by this, the page render freezes and the browser tries to quit the tab.
	//JS equivalent of doing repaint or Application.DoEvents().
	setTimeout(function(){
		//Set the DOM object anchors
		statusEle = document.getElementById('status')
		fileContentEle = document.getElementById('file-content')
		fullTableEle = document.getElementById('full-table')
		htmlTranscoder = document.getElementById('htmlTranscoder')
		delimiterEle = document.getElementById('delimID')
		stringDelimiterEle = document.getElementById('stringdelimID')
		fileInput = document.getElementById('file-input') 
		progressDoneEle= document.getElementById('percentDone')
		progressStepEle= document.getElementById('percentStep')
		//Add listener to file selection button
		fileInput.addEventListener('change', readSingleFile, false);
		//Hide all tabs ( Vestigial )
		showTab('','');
		//Show the content table (as opposed to list)
		showTab("","full-table")
		//Set progress bar to default state
		progressDoneEle.style.width="0%";
		progressStepEle.style.width="0%";
		//create the template for cellMenu		
		cellMenu.className="dropdown"
		cellMenu.style="float:left;width:100%"
		cellMenu.innerHTML ='<button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="float:left;width:100%;">'
		cellMenu.innerHTML += '</button>'
		cellMenu.innerHTML += ('<ul class="dropdown-menu" aria-labelledby="dropdownMenuButtonSM">' +
			'<li><h6 class="dropdown-header">Cell Actions</h6></li>'+
			'<li><a class="dropdown-item" onclick="mergeLt({row},{col})">Merge Left</a></li>'+
			'<li><a class="dropdown-item" onclick="mergeRt({row},{col})">Merge Right</a></li>'+
			'<li><a class="dropdown-item" onclick="mergeRow({row},{col})">Merge Row</a></li>'+
			'<li><a class="dropdown-item" onclick="splitRow({row},{col})">Split Row</a></li>'+
			'<li><a class="dropdown-item" onclick="splitCel({row},{col})">Edit Cell</a></li>'+
			'</ul>')
		//Prompt the user to select a file
		statusEle.textContent='Select a file to begin.\n'
	},100)
}

//}

/*		DISPLAY FUNCTIONS   *///{
function generateList(){
	// Set to 0 for new parsing
	pageRowCount = 0
	//remove CR/return, and split on newline
	rows=contents.replaceAll("\r","").split("\n")
	//lock to max row count
	while((currentPage*pageSize) >rows.length){
		currentPage--
	}
	//Grab the headers and split to get the column count
	headers = rows[0].split(delimiter);
	//Result bucket
	result = document.createElement("div");
	//Header entry in the list
	header = document.createElement("span");
	header.textContent = "0: "+rows[0]
	//Insert header at top of result
	result.appendChild(header)
	//Line to differentiate from header row and data row
	result.appendChild(document.createElement("hr"))
	//For each row starting from currentpage*pagesize, until end of table or displayed rows meets max page rows
	for(i = (currentPage*pageSize)+1; i < rows.length && pageRowCount<pageSize; i++){
		//split row on delimiter (we want the most stupid, straightforward CSV parsing rules - this assures it can be parsed by anything including the most stupid and straightforward parsing rules.)
		row = rows[i].split(delimiter)
		//If isErr (is "error view") is true, only return lines that split into too many cells or are incorrectly quoted. Otherwise return any line.
		if(row.length != headers.length || hasBadQuotes(row) || isErr==false){		
			//make a span element, add the row ID and row content, append to result bucket
			rowSpan = document.createElement("span");
			rowSpan.textContent=""+i+": "+rows[i]
			result.appendChild(rowSpan)
			result.appendChild(document.createElement("br"))
			//Increment row count to make sure we don't go over page limit
			pageRowCount++;
		}
	}
	//when it's all done return the table to be added to the DOM
	return result;
}
function generateErrorTable(){
	// Set to 0 for new parsing
	pageRowCount = 0
	//remove CR/return, and split on newline
	rows=contents.replaceAll("\r","").split("\n")
	//lock to max row count
	while((currentPage*pageSize) >rows.length){
		currentPage--
	}
	//Grab the header row and split into cells
	headers = rows[0].split(delimiter);
	//Create table to hold content
	table = document.createElement("table")
	table.className = "table table-bordered table-striped"
	//Create table head
	thead = document.createElement("thead")
	table.appendChild(thead)
	//Create header row
	headerRow = thead.insertRow()
	headerRow.id="rowhead"
	headerRow.className='errorRow'
	//Adds the first cell specifying the Row ID column
	headerRowCell =headerRow.insertCell()
	headerRowCell.innerText="Row"
	//For each column header, create a cell with the header text
	for(i = 0; i < headers.length; i++){		
		headerRowCell2 = headerRow.insertCell()
		headerRowCell2.scope="col"
		headerRowCell2.innerText=headers[i].replaceAll('"','')
	}
	//Create the table body and add
	tbody = document.createElement("tbody")
	table.appendChild(tbody)
	
	//For each row starting from currentpage*pagesize, until end of table or displayed rows meets max page rows
	for(i = (currentPage*pageSize)+1; i < rows.length && pageRowCount<pageSize; i++){
		
		//split row on delimiter (we want the most stupid, straightforward CSV parsing rules - this assures it can be parsed by anything including the most stupid and straightforward parsing rules.)
		row = rows[i].split(delimiter)		
		
		//If isErr (is "error view") is true, only return lines that split into too many cells or are incorrectly quoted. Otherwise return any line.
		if(row.length != headers.length || hasBadQuotes(row) || isErr==false){	
			//Create row to hold cells
			tableRow = tbody.insertRow()
			tableRow.id="row"+i
			tableRow.className='errorRow'
			//Add the first cell holding the row ID
			cell = tableRow.insertCell()
			cell.innerHTML = "<th "+/*"scope='row'" + /**/ "onclick='replaceRow("+i+")'>"+i+"</th>"
			//Detects if the current cell is between a pair of badquote cells - visual aid to see the bounds of a splatted cell.
			inQuote = false;			
			//For each column in the row
			for(j = 0; j < row.length; j++){
				//Create cell to contain column text as well as cell menu
				tableCell =tableRow.insertCell()
				//Create div for column text
				tableCellValue = document.createElement("div")
				tableCellValue.innerText=htmlEncode(row[j])
				tableCellValue.style="float:left;height:100%"
				//Create element containing cell menu, replacing placeholders with row and column id so functions can properly target cell
				cellMenuCell =  document.createElement("div")
				cellMenuCell.appendChild(cellMenu.cloneNode(true))//Clone the menu template we prepared earlier
				cellMenuCell.lastChild.innerHTML = cellMenuCell.lastChild.innerHTML.replaceAll("{row}",i).replaceAll("{col}",j)
				cellMenuCell.style="float:left;width:100%"
				//Add column content and menu to cell
				tableCell.appendChild(tableCellValue)
				tableCell.appendChild(cellMenuCell)	
				//Set the color depending on situation
				//if quotes aren't exactly two or zero or are not at the extremes of the cell content (something is wrong with quotes in this cell, quotes in quotes or splatted cell because of internal delimiter)
				if(checkQuotes(row[j])){
					tableCell.className = "table-warning"
					inQuote = !inQuote
				}
				//if the cell is off-table (cell index past header count)
				else if (!(j<headers.length)){
					tableCell.className = "table-danger"
				}else{
					if(inQuote){
						//If the cell is ok, but is between two cells with bad quotes (likely splatted)
						tableCell.className = "table-info"
					}else{
						//if the cell is ok by all measuers
						tableCell.className = "table-success"
					}
				}
			}
			//Increment row count to make sure we don't go over page limit
			pageRowCount++;	
		}
	}
	//when it's all done return the table to be added to the DOM
	return table;
}
function displayContents(weight) {
	//*//   This is the start of the flipping code blocks. //star// will run the production code, swap to the other block by removing the first slash to get /star//
	setStatus("Displaying Contents",weight)
	setTimeout(
		function(){		
			fileContentEle.innerHTML=""
			fileContentEle.appendChild(generateList());
			fullTableEle.innerHTML=""
			fullTableEle.appendChild(generateErrorTable());
			setStatus("Done",progressTotal)		
			setStatus("Done",0)		
		},100
	);
/*/   //Don't touch this, core to the flipping comment blocks
	//This is just a section for demo/dev code - flipping comment blocks are fun
	console.log("Display Contents running dev code")
//*/  //Also don't touch this, same reason.
}
function setStatus(str, val){
		//Add the previous step's score to the progress
		progressDone += progressStep
		//Bind to progress total to prevent overflow
		if(progressDone>progressTotal){progressDone=progressTotal;val=0;}
		//Set the current step's score (to be added when the step is completed)
		progressStep=val;
		//console.log(progressDone + " : " + progressStep + " : " + progressTotal + " : " + stepFragment); //Debug line, harmless so I'm leaving it.
		//Set the completed progress width
		progressDoneEle.style.width=""+progressDone+"%";
		//Set the current step's width
		progressStepEle.style.width=""+progressStep+"%";
		//Set the status text
		statusEle.textContent=str
}
function showTab(header,tab){
	//Flips a viewer's visibility (list/table) or hides all. To show a specific viewer, hide all then unhide preferred view
	if(tab!=""){
		if(document.getElementById(tab).style.display=="block"){
			document.getElementById(tab).style.display="none"
		}else{		
			document.getElementById(tab).style.display="block"
		}
	}	
	else{
		fileContentEle.style.display="none"
		fullTableEle.style.display="none"
	}
}
//}

/*		TASK ENGINE			*///{
function regexContents(regex, status, replace){
	//unshift so Last In First Out (LIFO) - don't move on to the next step until all instances of this step are complete.
	singleRow = function (){
		//replace all instances of the current regex
		contents = contents.replaceAll(regex, replace)		
		//Check to see if there's instances left (sometimes removing one creates another)
		testFunction = function(){
			//if instances remain
			if(regex.test(contents)){
				tasks.unshift(singleRow)
			}
		}
		tasks.unshift(testFunction)
	}
	tasks.unshift(singleRow)
	tasks.unshift(function(){		
		setStatus(status,stepFragment)
	})
}
function doTask(){
	if(tasks.length > 0){
		//Take the first element out and execute it
		task = tasks.shift();
		task();
		setTimeout(doTask, 100);
	}else{
		//If no tasks are left, display result
		displayContents();
	}
}
//}

/*		UTILITY FUNCS		*///{
function htmlDecode(value) {
	//Uses a hidden DOM element to transcode html-encoded chars to text
	htmlTranscoder.innerHTML =value
	return htmlTranscoder.textContent;
  }
function htmlEncode(value) {  
	//Should do the reverse
	htmlTranscoder.textContent =value
	return htmlTranscoder.innerHTML;
  }
function checkQuotes(value){
	return (
		//There is a quote somewhere else than start or finish
		(value).substring(1,(value).length-1).includes('"')
		//There is a quote at the beginning but not the end
		|| ((value).substring(0,1)=='"' && ((value).substring((value).length-1,(value).length)!='"'))
		//There is a quote at the end but not the beginning
		|| ((value).substring(0,1)!='"' && ((value).substring((value).length-1,(value).length)=='"'))
	)
}
function hasBadQuotes(value){
	//Check Quotes applied to an array of cells
	for(k = 0; k < value.length; k++){
		if(checkQuotes(value[k])){
			return true
		}
	}
	return false
}

//}

/*		TABLE FUNCTIONS		*///{
function stringAll(){
	//removes all quotes then blindly wraps every cell in quotes by wrapping the delimiter in quotes then one at the start and one at the end.
	contents = '"' + contents.replaceAll('"','').replaceAll(delimiter, '"'+delimiter+'"').replaceAll("\n",'"\n"')+'"'
	displayContents(100);
}


function fixAll(){
	//Init progress stats
	progressTotal=110
    progressDone=0;
    progressStep=0;
	//Set the status
	setStatus("Starting",0)
	//Clear the task queue
	tasks = []	
	//There's 11 - or there was 11 - steps, so divide total by number of steps to get step size
	stepFragment = Math.floor(progressTotal/11)
	//Push so the step order is correct when executing (FIFO). Anon function calls regexContents with appropriate regex, status message, and replacement string
	tasks.push(function(){regexContents(regexdelimstringSpace, 'Removing leading spaces before strings',delimiter+'"')});
	tasks.push(function(){regexContents(regexNewline, 'Removing newlines','')});
	tasks.push(function(){regexContents(regexDelim, 'Removing internal delimiters','')});
	tasks.push(function(){regexContents(regexPadQuotes, 'Removing leading quotes','')});
	tasks.push(function(){regexContents(regexTrailQuotes, 'Removing trailing quotes','')});
	tasks.push(function(){regexContents(regexQuotes, 'Removing internal quotes','')});	
	tasks.push(function(){regexContents(regexNewline, 'Removing newlines','')});	
	tasks.push(function(){regexContents(regexPatchQuotes, 'Patching orphan quotes','""')});
	tasks.push(function(){regexContents(regexQuotes, 'Removing internal quotes - last pass','')});		
	tasks.push(function(){regexContents(regexLeadingSpaces, 'Removing leading spaces','')});
	tasks.push(function(){regexContents(regexDelim, 'Removing internal delimiters - last pass','')});
	//tasks.push(function(){regexContents(regexBadChar, 'Removing Bad Characters','')});
	//Blank out the content box in preparation
	fileContentEle.textContent = "";
	//Trigger the task engine
	setTimeout(doTask,100);
}
//}

/*		FILE HANDLING		*///{
	
function reloadFile(){
  //Init progress vars for job
  progressTotal=100
  progressDone=0;
  progressStep=0;
  //set status
  setStatus("Loading File",10)
  //Trigger file opening
  setTimeout(function(){reader.readAsText(file, document.getElementById("disabledSelect").value);},100);  
}

function saveFile(){	
	//create an invisible link to a blobelement containing the full contents
	const a = document.createElement('a');
	var blob = new Blob([contents],
		{ type: "text/plain;charset=UTF-8" });
	a.href= URL.createObjectURL(blob);
	//set filename
	a.download = "CSVOutput.csv";
	//click invisible link to start save
    a.click();
	//No idea what this does tbh, stackoverflow
	URL.revokeObjectURL(a.href);
}
function saveFilePaginated(pageLen){	
	//create an invisible link to a blobelement containing the full contents
	Parts = []
    contentSplit = contents.split("\n")	
    resultstr = ""
	pagesize = pageLen
	currentPage = 0
	loop = true
	while(loop){
		loop=false
		resultstr = contentSplit[0]+"\n"
		for(index=(1+(currentPage*pagesize));index<((currentPage+1)*pagesize)+1 && index < contentSplit.length;index++){
			console.log(index);
			resultstr+=contentSplit[index]+"\n"	
			loop=true
		}
		if(loop){
			const a = document.createElement('a');
			var blob = new Blob([resultstr.replace(/\n+$/, "")],
		{ type: "text/plain;charset=UTF-8" });
			a.href= URL.createObjectURL(blob);
			//set filename
			a.download = "CSVOutput.csv";
			//click invisible link to start save
			a.click();
			//No idea what this does tbh, stackoverflow
			URL.revokeObjectURL(a.href);
		}
		currentPage++
	}
}
function readSingleFile(e) {
  //Init progress vars for job
  progressTotal=100;
  progressDone=0;
  progressStep=0;
  //set status
  setStatus("Loading File",10)
  //Get first file returned from file selection
  file = e.target.files[0];
  if (!file) {
	//if file is null, escape hatch
    return;
  }
  //Set up the event that will trigger when the reader is done reading the file
  reader.onload = function(e) {
	//grab configured delimiter
	delimiter=delimiterEle.value
	//grab whether configured to remove diacritics
	removeDiac = document.getElementById("removeDiac").checked
	//Generate regex using set delimiter
	regexDelim = new RegExp('(((?<=('+delimiter+'|\\n)"[^"'+delimiter+']+)'+delimiter+'))', 'g')
	regexNewline = new RegExp('((?<=('+delimiter+'|\\n)\\s?"[^'+delimiter+'"]+)\\r?\\n(?=[^'+delimiter+'"]+")|(?<=('+delimiter+'|\\n)\\s?"([^"'+delimiter+'])+)\\r?\\n(?="'+delimiter+')|(?<='+delimiter+'\\s?")\\r?\\n(?="'+delimiter+')|((\\n)+(?=([^"'+delimiter+']*\\n?)"'+delimiter+'))|(\\n(?=\\n))'+/**/'|((?<='+delimiter+'"[^"][^'+delimiter+']+)\\n(?=[^"]+?"'+delimiter+'))'+/**/'|(\\n(?=[^"][^'+delimiter+']+"'+delimiter+'))'+/**/')', 'g')//
	regexQuotes = new RegExp(/**/'(?<=[^"'+delimiter+'\n])"(?=[^"'+delimiter+'\n])'/*/'(?<=('+delimiter+')\\s?"[^"]+)"(?=[^\\n'+delimiter+']+"'+delimiter+')'*/, 'g')
	regexTrailQuotes = new RegExp('(?<=[^'+delimiter+'"\\n]\\s?)"(?=")', 'g')
	regexPadQuotes =   new RegExp('(?<=(\\n|'+delimiter+')\\s?")"(?=[^'+delimiter+'\\n]+?")', 'g')
	regexPatchQuotes = new RegExp('(?<=[\\n'+delimiter+'])"(?=[\\n'+delimiter+'])', 'g')
	regexLeadingSpaces = new RegExp("(?<=\") +","g")
	regexdelimstringSpace = new RegExp('('+delimiter+' "|" '+delimiter+')', 'g')
	regexBadChar = new RegExp("[^a-zA-Z0-9 -\\.;<>/ ='\"{}\\[\\]\\^\\?_\\\\\\|:\\r\\n~@éàèêîôâûçäöüëïÄÖÜËÏÇÉÈÀÊÂÎÔß]", 'g') //[^a-zA-Z0-9 -\.;<>/ ='{}\[\]\^\?_\\\|:\r\n~@éàèêîôâûçäöüëïÄÖÜËÏÇÉÈÀÊÂÎÔß]
	//Set next status
	setStatus("Assigning File to variable",20)
	//Next step
    setTimeout(function(){	
		//Set content variable to contents of file
		contents = e.target.result
		//If user wants diacritics removed
		if(removeDiac){
			setStatus("Removing Diacritics",50)
			statusEle.textContent = "Removing Diacritics"
			setTimeout(function(){	
				//This normalization mode breaks accented character to the root character and a second diacritic character that stacks. We then remove all characters of class diacritic.
				contents = contents.normalize("NFD").replaceAll(/\p{Diacritic}/gu, "")
				/*In case their DB html-encoded some symbols*/
				fileContentEle.innerHTML = htmlDecode(contents)
				//Set the content variable to the cleaned up result, remove any CR/returns and any dangling newlines
				contents = fileContentEle.textContent.replaceAll("\r","").trim("\n")
				//Clear the element we used for the cleanup
				fileContentEle.innerHTML = ""
				/*Display result*/				
				displayContents(20)
			},100)
		}else{			
			/*In case their DB html-encoded some symbols*/
			fileContentEle.innerHTML = htmlDecode(contents)
			//Set the content variable to the cleaned up result, remove any CR/returns and any dangling newlines
			contents = fileContentEle.textContent.replaceAll("\r","").trim("\n")
			//Clear the element we used for the cleanup
			fileContentEle.innerHTML = ""
			/*Display result*/				
			displayContents(20)
		}
	},100)
  };
  //Next Step - read the file
  setTimeout(function(){
	reader.readAsText(file, document.getElementById("disabledSelect").value);
	
  },100);  
  
}


//}

/*		CELL ACTIONS		*///{
	
function replaceRow(k){
	rows=contents.replaceAll("\r","").split("\n")
	row = window.prompt("Please modify the string then submit",rows[k]).replace("\\n","\n")
	if(row!=null){
		rows[k]=row
		contents = rows[0]
		for(j = 1; j < rows.length; j++){
			if(rows[j]!=""&&rows[j]!=" "){
				contents+="\n"+rows[j]
			}
		}
		displayContents()
	}
}
function mergeLt(r,c){
	if(c==0){return}
	rows=contents.replaceAll("\r","").split("\n")
	row = rows[r]
	if(row!=null){
		cells = row.split(delimiter);
		cellStr = ""
		for(j = 0; j < cells.length;j++){
			cellStr += cells[j]
			if(j!=c-1 && j<(cells.length-1)){
				cellStr+=delimiter
			}
		}
		rows[r]=cellStr
		contents = rows[0]
		for(j = 1; j < rows.length; j++){
			if(rows[j]!=""&&rows[j]!=" "){
				contents+="\n"+rows[j]
			}
		}
		displayContents()
	}
	
}
function mergeRt(r,c){
	rows=contents.replaceAll("\r","").split("\n")
	row = rows[r]
	if(row!=null){
		cells = row.split(delimiter);
		if(c>(cells.length-2)){return}
		cellStr = ""
		for(j = 0; j < cells.length;j++){
			cellStr += cells[j]
			if(j!=c && j<(cells.length-1)){
				cellStr+=delimiter
			}
		}
		rows[r]=cellStr
		contents = rows[0]
		for(j = 1; j < rows.length; j++){
			if(rows[j]!=""&&rows[j]!=" "){
				contents+="\n"+rows[j]
			}
		}
		displayContents()
	}
	
}
function mergeRow(r,c){
	rows=contents.replaceAll("\r","").split("\n")
	row = rows[r]
	if(row!=null){
		cells = row.split(delimiter);
		cellStr = ""
		for(j = 0; j < cells.length && j < (c+1);j++){
				cellStr += cells[j]
				cellStr+=delimiter
		}
		rows[r]=cellStr
		contents = rows[0]
		for(j = 1; j < rows.length; j++){
			if(rows[j]!=""&&rows[j]!=" "){
				if(j!=r+1){contents+="\n"}
				contents+=rows[j]
			}
		}
		displayContents()
	}	
	
}
function splitRow(r,c){
	rows=contents.replaceAll("\r","").split("\n")
	row = rows[r]
	if(row!=null){
		cells = row.split(delimiter);
		cellStr = ""
		for(j = 0; j < cells.length;j++){
			cellStr += cells[j]		
			if(j!=(cells.length-1)){		
				if(j==c){				
					cellStr+="\n"
				}else{
					cellStr+=delimiter
				}
			}
		}
		rows[r]=cellStr
		contents = rows[0]
		for(j = 1; j < rows.length; j++){
			if(rows[j]!=""&&rows[j]!=" "){
				contents+="\n"+rows[j]
			}
		}
		displayContents()
	}	
	
}
function splitCel(r,c){
	rows=contents.replaceAll("\r","").split("\n")
	row = rows[r]
	if(row!=null){
		cells = row.split(delimiter);
		cellStr = ""
		for(j = 0; j < cells.length;j++){			
			if(j==c){
				cellStr += window.prompt("Please modify the string then submit", cells[j]).replace("\\n","\n")
			}else{
				cellStr += cells[j]	
			}
			if(j!=(cells.length-1)){
				cellStr+=delimiter
			}
		}
		rows[r]=cellStr
		contents = rows[0]
		for(j = 1; j < rows.length; j++){
			if(rows[j]!=""&&rows[j]!=" "){
				contents+="\n"+rows[j]
			}
		}
		displayContents()
	}	
}	
	
	
	
//}