## Powershell Scripts

### [[Exchange Scripts]](https://read-0nly.github.io/PSRepo/EXO)
### [[Fun Scripts]](https://read-0nly.github.io/PSRepo/Fun)
### [[MDM-related Scripts]](https://read-0nly.github.io/PSRepo/MDMTools)
### [[Utility scripts/Misc]](https://read-0nly.github.io/PSRepo/Utility)

## Snippets

**Convert Base64 blob to UTF 8 (Stop using suspicious online decoders!)**

```powershell
[System.Text.Encoding]::UTF8.getString([convert]::FromBase64String((read-host "Enter base64 blob")))
```
**Process-port map**

```powershell
[System.Text.Encoding]::UTF8.getString([convert]::FromBase64String((read-host "Enter base64 blob")))
```

**Fetch the enrolling user of an enrolled device without talking to AAD/Intune or being in that user's session**
```powershell
(Get-NetTCPConnection )|%{$_.ciminstanceproperties |where-object {$_.Name -eq "OwningProcess" -or $_.Name -eq "RemoteAddress" -or $_.Name -eq "RemotePort"} | % -begin {$str = @{}} -process {$str+=@{$_.Name=$_.Value}} -end {$str2 = (Get-WmiObject Win32_Process -Filter ("ProcessId = "+$str["OwningProcess"]) | Select-Object ProcessID, CommandLine);$str["cmd"]=$str2.commandline; echo ([pscustomobject]$str)}} |select *| Export-Csv (read-host "enter save path")
```

**Happy Friday**

```powershell
$global:ascii = "╬░♥╔╗─╔╦═══╦═══╦═══╦╗──╔╗♥░─╬`n╬░♥║║─║║╔═╗║╔═╗║╔═╗║╚╗╔╝║♥░─╬`n╬░♥║╚═╝║║─║║╚═╝║╚═╝╠╗╚╝╔╝♥░─╬`n╬░♥║╔═╗║╚═╝║╔══╣╔══╝╚╗╔╝─♥░─╬`n╬░♥║║─║║╔═╗║║──║║────║║──♥░─╬`n╬░♥╚╝─╚╩╝─╚╩╝──╚╝────╚╝──♥░─╬`n╬░♥╔═══╗───╔═╗─╔═╗───────♥░─╬`n╬░♥║░══╬═╦═╬═╬═╝░╠═══╦═╦═╗░─╬`n╬░♥║░╔═╣░╔═╣░║╔╗░║╔╗░╠══░║░─╬`n╬░♥╚═╝░╚═╝░╚═╩═══╩═╩═╩═══╝░─╬"
$red = [char]27 + "[91m"
$yellow = [char]27 + "[93m"
$blue = [char]27 + "[94m"
$green = [char]27 + "[92m"
$reset = [char]27 + "[0m"
$yellows = @("╔","╦","╗","╚","═","╝","║","╠","╣","╩","╬")
$reds = @("♥")
$blues = @("─")
$greens = @("░")
$animationDelay = 1
function draw {
  cls
  $yellows | %{$global:ascii = $global:ascii.replace($_,($yellow+$_))}
  $reds | %{$global:ascii = $global:ascii.replace($_,($red+$_))}
  $blues | %{$global:ascii = $global:ascii.replace($_,($blue+$_))}
  $global:ascii += $reset
  $global:ascii | out-host
  start-sleep $animationDelay
  cls
  $yellows | %{$global:ascii = $global:ascii.replace($_,($green+$_))}
  $reds | %{$global:ascii = $global:ascii.replace($_,($red+$_))}
  $blues | %{$global:ascii = $global:ascii.replace($_,($blue+$_))}
  $global:ascii += $reset
  $global:ascii | out-host
  start-sleep $animationDelay
}
while ($true){
  draw
}
```


**VT100 Formatting Object**
```powershell
$VT100 = [pscustomobject]@{
    "Fore" = @{
        "Black" = [char]27+"[30m" ;
        "Red" = [char]27+"[31m" ;
        "Green" = [char]27+"[32m" ;
        "Yellow" = [char]27+"[33m" ;
        "Blue" = [char]27+"[34m" ;
        "Magenta" = [char]27+"[35m" ;
        "Cyan" = [char]27+"[36m" ;
        "White" = [char]27+"[37m" ;
        "Extended" = [char]27+"[38m" ;
        "Reset" = [char]27+"[39m" ;
        "Black+" = [char]27+"[90m" ;
        "Red+" = [char]27+"[91m" ;
        "Green+" = [char]27+"[92m" ;
        "Yellow+" = [char]27+"[93m" ;
        "Blue+" = [char]27+"[94m" ;
        "Magenta+" = [char]27+"[95m" ;
        "Cyan+" = [char]27+"[96m" ;
        "White+" = [char]27+"[97m" ;       
    }
    "Back" = @{
        "Black" = [char]27+"[40m" ;
        "Red" = [char]27+"[41m" ;
        "Green" = [char]27+"[42m" ;
        "Yellow" = [char]27+"[43m" ;
        "Blue" = [char]27+"[44m" ;
        "Magenta" = [char]27+"[45m" ;
        "Cyan" = [char]27+"[46m" ;
        "White" = [char]27+"[47m" ;
        "Extended" = [char]27+"[48m" ;
        "Reset" = [char]27+"[49m" ;
        "Black+" = [char]27+"[100m" ;
        "Red+" = [char]27+"[101m" ;
        "Green+" = [char]27+"[102m" ;
        "Yellow+" = [char]27+"[103m" ;
        "Blue+" = [char]27+"[104m" ;
        "Magenta+" = [char]27+"[105m" ;
        "Cyan+" = [char]27+"[106m" ;
        "White+" = [char]27+"[107m" ;    
    
    }
    "Style" = @{
        "Bold" = [char]27+"[1m"
        "NoBold" = [char]27+"[22m"
        "Underline" = [char]27+"[4m"
        "NoUnderline"=[char]27+"[24m"
        "Negative" = [char]27+"[7m"
        "Positive" = [char]27+"[27m"
    }
    "ResetAll" = [char]27+"[0m"
}
```

```powershell
#The color name on it's own is the "dark/nonbright/notbold" version of the color, the color name with a '+' is the bright color.
#These can be combined. For instance: 
$VT100.Fore["Red"]+$VT100.Style["Underline"]+"Hello "+$VT100.style["Negative"]+$VT100.Style["Bold"]+"Ghost"+$VT100.resetall
```


## Bootstrap script as task:
```powershell
# Script bootstrapper
# Saves the script body to a file and creates a task to run it

#Full contents of script in literal string
$ScriptBody = @"
write-host "This is a scheduled task"
read-host "Press enter to continue"
"@

#Path to save the script
$ScriptPath = "C:\Task.ps1"

#Save script
$ScriptBody | out-file $ScriptPath

#Run task every day at noon
$Time = New-ScheduledTaskTrigger -At 12:00 -daily

#When task runs, execute powershell and run the script
$PS = New-ScheduledTaskAction -Execute "PowerShell.exe" -argument "-file $ScriptPath"

#Run as CURRENT USER / Any User
$Principal = (New-ScheduledTaskPrincipal -GroupId "BUILTIN\Users")

#Register task
Register-ScheduledTask -TaskName "BootstrappedScript" -Trigger $Time -Principal $Principal -Action $PS`
```

## Scan ACLs for user-writeable path
```powershell
$Folders = dir C:\programdata -Recurse -erroraction silentlycontinue
$ACLs = $folders | get-acl -erroraction silentlycontinue
$ACLS | where-object {$_.AccessToString -like "*BUILTIN\Users*FullControl*"} | select path, accesstostring

```
