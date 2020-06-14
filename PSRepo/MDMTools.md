# MDMTools #
[AgentLaunch](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/AgentLaunch.ps1)

Executes a .ps1 script in powershell by calling it through AgentExecutor - handy for making sure the script executes as it should on the device, free from Intune involvement. If it works here but not through Intune, something is going on between Intune and the device, if it doesn't work here either, then the device should be suspicious. Anti-viruses will sometimes sandbox AgentExecutor and make it think it succeeded when it didn't execute anything. Run through here, review .error and .output, and look and AgentExecutor logs to figure out what happened in the attempt.

[AutoAutopilot](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/AutoAutopilot.ps1)

Pretty much run and wait - it'll gather the hash, save it to CSV, upload it to Intune, assign the user and group as required, then if you'd like it uses sysprep to force the device back to OOBE to do the autopilot enrollment without resetting windows. Using sysprep to do this is not recommended. I don't suggest ever letting it do so, but it's handy when testing with a VM you don't have access to reset and only moderately care about.

[AutopilotAssigner](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/AutopilotAssigner.ps1)

After using a profile that targets a device for Autopilot Conversion, the autopilot object doesn't create the AAD object until something targets for having a ZTDID tag. This means that whatever profile is applied to the generic **contains ztdid** group is the profile these devices will get, and things like model information can't be used for targeting until after a join is done on the new AAD object, so you end up needed to do OOBE twice if you want a specific profile targeted by something like model info to apply to the device.

This script will pull all devices that have no OrderID assigned, only ZTDID. After that, you can modify the CSV to add the order ID representing the Autopilot Profile you actually want the device to get, then you "press any key" and that CSV is reapplied, adding the OrderID to the device.

This way, instead of enrolling twice, you target the device for conversion, create a generic autopilot profile that targets devices that contain ZTDID to generate the AAD object, then run this and assign the necessary OrderID so that the correct dynamic group picks it up, so the proper profile applies. Then reset the device and only have to OOBE once.

[Fetch-GraphToken.ps1](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/Fetch-GraphToken.ps1)

Utility script, really. just loads azuread and generates a token the quick and dirty way. handy to reference using iex (iwr "url://").content

[Generate AppControl Exclusions](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/Generate-AppcontrolExcusions.ps1)

App Control is a bit of a pain to configure. Sometimes you're ok with trading a bit of security for just getting the thing working

This will make path based excusions for all your win32 apps, then convert it to bin ready for upload to intune.

[Get-DetectionPath.ps1](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/Get-DetectionPath.ps1)

Returns the detection paths of all listed win32 apps - allows for quick and dirty generation of applocker files. Not the ideal method because it doesn't check publisher or anything but file-based applocker rules will work for most situations.

[Get-NoncomplianceReport.ps1](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/Get-NoncomplianceReport.ps1)

Generates an overview of all failing compliance settings for all devices - basically a report of what needs to be corrected across the org. Uses a fork of the microsoft.graph.intune powershell module because the official one has a bug (detail in code comments)

Example output:

```
Initialization Started
  Module folder found!
  Module download found!
  Module loaded!
Success - Executing
  Getting Devices
  Getting Policy states
  Getting Setting states
  Generating Report

deviceName                     settingName          userPrincipalName              state
----------                     -----------          -----------------              -----
admin_Android_3/5/2020_5:53 PM RequireRemainContact admin@contoso.onmicrosoft.com nonCompliant
admin_Android_3/5/2020_5:59 PM RequireRemainContact admin@contoso.onmicrosoft.com nonCompliant
DESKTOP-QQ89JMA                OsMinimumVersion     admin@contoso.onmicrosoft.com nonCompliant
DESKTOP-TIDP4LG                RequireRemainContact admin@contoso.cf              nonCompliant
DESKTOP-TIDP4LG                RequireUserExistence bitlocker.test@contoso.cf     nonCompliant
DESKTOP-AJ887VM                RequireRemainContact bitlocker.test@contoso.cf     nonCompliant


Enter 'Y' to save:
```

[Prep PS Intune](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/PrepPSIntune.ps1)

Downloads AAD module with install-module and the Intune Sample Scripts straight from github then extracts them to $Env.UserProfile\IntuneSamples. Easy snippet to add to scripts that depend on them to make it easier to use the script on other devices.

[PSVPP](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/psvpp.ps1)

Lets you query VPP directly using the VPP token provided by Apple - handy for troubleshooting issues syncing VPP licenses. If the changes don't come out with this either, the issue is with Apple not providing updated information. If the changes are here but not in your MDM, the MDM isn't updating with the info Apple sends.
