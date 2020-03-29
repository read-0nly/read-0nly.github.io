
$global:CurrentContainer = @{}
$global:CurrentContainerFilePath = ""
$global:Path = "\"


function loadFile(){
param(
        [string]$FilePath = (Read-host "Enter path to Container")
    )
    $global:CurrentContainer = (PSObj2Hashtable ((get-content $FilePath -Stream Container)| convertfrom-json))
    $global:CurrentContainerFilePath = $FilePath
}
function saveFile(){
    $global:CurrentContainer | convertto-json | Set-content ($global:CurrentContainerFilePath) -stream "Container"
}

function fetchPath(){
    param(
        [string[]]$PathParts,
        [hashtable]$CurrentDepth
    )
    if($PathParts.Count -eq 1){
        if($PathParts[0].length -eq 0){
            return $CurrentDepth
        }
        else{ 
            return $CurrentDepth[$PathParts[0]]
        } 
    }
    else{
        $PathPartsNew = $PathParts[1..($PathParts.count-1)]
        fetchPath $PathPartsNew $CurrentDepth[$PathParts[0]]
    }
}
function fetchPathParent(){
    param(
        [string[]]$PathParts,
        [hashtable]$CurrentDepth
    )
    if($PathParts.Count -le 2){
        if(($PathParts[0].length -eq 0) -or ($PathParts.count -eq 1)){
            $CurrentDepth
        }
        else{
            $CurrentDepth[$PathParts[0]]
        } 
    }
    else{
        $PathPartsNew = $PathParts[1..($PathParts.count-1)]
        fetchPathParent $PathPartsNew $CurrentDepth[$PathParts[0]]
    }
}

function enumerateLocation(){
        write-host ("Current ContainerLevel: "+$global:Path) -foregroundcolor Magenta
        $PathParts = ($global:Path+"\@").split("\")[1..( ($global:Path+"\@").split("\").count-1)]
        try{
            $currentValue = (fetchPath $PathParts $global:CurrentContainer)
            write-host "--------------------------------------------------" -foregroundcolor green
            write-host $currentValue -foregroundcolor yellow
        }
        catch{

        }
        
        write-host "--------------------------------------------------" -foregroundcolor green
        $PathParts = $global:Path.split("\")[1..($global:Path.split("\").count-1)]
        (fetchPath $PathParts $global:CurrentContainer)
}

function explorerLoop(){
    $Continue = $true
        cls
        Write-host 
        enumerateLocation
    While($Continue){
        cls
        Write-host 
        enumerateLocation
        write-host
        $global:Expcmd = (read-host "Enter command")
        if($Expcmd -like "cd *"){
            $targetpath = (($global:Expcmd).replace("cd ",""))
            if($targetpath[0] -eq "\"){
                $global:Path= $targetpath
            }
            elseif($targetpath[0] -eq "."){
                if($targetpath[1] -eq "."){
                    $PathParts = $global:Path.split("\")
                    $NewPath = ""
                    if($PathParts.count -gt 2){
                        $PathParts[1..($pathparts.count-2)] | %{$newpath +="\"+$_}
                    }
                    else{
                        $NewPath = "\"
                    }
                    $global:Path = $NewPath
                }              
                elseif($targetpath[1] -eq "\"){
                    $global:path += $targetpath.replace(".\","\")
                }
            }
            else{
                if($global:path[-1] -ne "\" ){
                    $global:path+= "\"
                }
                $global:Path += $targetpath
            }
        }
        elseif($Expcmd -like "add"){
            addLoop
        }
        elseif($Expcmd -like "del"){
            delLoop
        }
        elseif($Expcmd -like "set"){
            setLoop
        }
        elseif($Expcmd -like "quit"){
            $Continue = $false
        }
    }
}

function setLoop(){
    $Continue = $true
    While ($Continue){
        try{
            cls
            write-host
            enumerateLocation
            write-host
            $PathParts = ($global:Path).split("\")[1..( ($global:Path).split("\").count-1)]

            if( (fetchPathParent $PathParts $global:CurrentContainer)[$PathParts[-1]].gettype().name -eq "Hashtable"){
                (fetchPath $PathParts $global:CurrentContainer)["@"] = (read-host "Enter the new value")
            }
            else{
                (fetchPathParent $PathParts $global:CurrentContainer)[$PathParts[-1]] = (read-host "Enter the new value:")
            }
            
            cls
            write-host "Value Set!" -ForegroundColor green
            write-host
            enumerateLocation
            write-host
            $Continue = $false
            saveFile
        }
        catch{
            write-error "This failed for some reason"
            $Continue = (-not((read-host "Enter 'quit' to go back to explore mode, or anything else to continue") -eq "quit"))
        }
    }
    
}

function delLoop(){
    $Continue = $true
    While ($Continue){
        $Keypath = read-host "Enter KeyPath"
        try{
            if($keypath[0] -eq "\"){
                $PathParts = $Keypath.split("\")
                $PathParts = $PathParts[1..($pathparts.count-1)]
                cls
                write-host ("Content at path "+$keypath) -foregroundcolor magenta
                if((fetchPath $PathParts $global:CurrentContainer)["@"] -ne $null){
                    write-host "--------------------------------------------------" -foregroundcolor green
                    (fetchPath $PathParts $global:CurrentContainer)["@"]
                }
                write-host "--------------------------------------------------" -foregroundcolor green
                (fetchPath $PathParts $global:CurrentContainer)
                write-host "--------------------------------------------------" -foregroundcolor green
                if((fetchPath $PathParts $global:CurrentContainer)["@"] -ne $null){

                }
                if((read-host "Enter 'delete' to proceed with deleting entry") -eq "delete"){
                    (fetchPathParent $PathParts $global:CurrentContainer).remove($PathPArts[-1])
                    saveFile
                }
            }
            else{
                write-error  ("The path "+$Keypath + " doesn't start with '\' - use a full path, ie. \test\path\entry1")
            }

        }
        catch{
            write-host
            write-host ("The path "+$Keypath + " is not valid") -foregroundcolor Red
        }
        $Continue = (-not((read-host "Enter 'quit' to go back to explore mode, or anything else to continue") -eq "quit"))
    }
}

function addLoop(){
    $Continue = $true
    While ($Continue){
        cls
        write-host
        enumerateLocation
        write-host
        $EntryName = read-host "Enter the name of the new entry"
        $EntryValue = read-host "Enter the new value"
        try{
        if((fetchPath ($global:Path.split("\")[1..($global:Path.split("\").count-1)]) $global:CurrentContainer).getType().name -eq "Hashtable"){
            (fetchPath ($global:Path.split("\")[1..($global:Path.split("\").count-1)]) $global:CurrentContainer).add($EntryName,$EntryValue)
        }
        else{
            $CurrentValue = (fetchPath ($global:Path.split("\")[1..($global:Path.split("\").count-1)]) $global:CurrentContainer)
            (fetchPathParent ($global:Path.split("\")[1..($global:Path.split("\").count-1)]) $global:CurrentContainer)[$global:Path.split("\")[-1]] = @{
                "@"=$CurrentValue;
                $EntryName=$EntryValue;
            }
        }
            $Continue = $false
            saveFile
        }
        catch{
            $Continue = (-not((read-host "Enter 'quit' to go back to explore mode, or anything else to continue") -eq "quit"))
        }
    }
}

function PSObj2Hashtable(){
    param($PSObj)
    $PSObj2Hashtable = @{}
    $Keys = ($PSObj| Get-Member | where-object {$_.MemberType -eq "NoteProperty"}).Name
    $Keys | %{
        $valueFetch = [scriptblock]::Create(('param($PSObj); echo ($PSObj."'+$_+'")'));
        $value = (Invoke-Command $valueFetch -ArgumentList $PSObj)
        if($value.gettype().name -eq "PSCustomObject"){
            $value = (PSObj2Hashtable $value)
        }
        $PSObj2Hashtable.add($_,$value);

    }
    return $PSObj2Hashtable
}



loadFile (read-host "Enter the path to the container file")
explorerLoop
