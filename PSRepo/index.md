### Powershell Script Showcase

**[Get-NonComplianceReport](https://github.com/read-0nly/PSRepo/blob/master/MDMTools/Get-NoncomplianceReport.ps1)** [2020/06/07]

This script uses a modified version of Microsoft.Graph.Intune to return a report of the settings flagged non-compliant on all devices.
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
