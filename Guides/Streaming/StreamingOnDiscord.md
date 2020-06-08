### Streaming on Discord (Hold a low-quality watch party during the apocalypse!)

- First, get a [discord](https://discordapp.com/) account. If you're hosting, you probably want to download the desktop client at the same time
- Get your friends to do the same and [add eachother](https://support.discordapp.com/hc/en-us/articles/217674288-Friends-List-101)
- Someone make a [server](https://support.discordapp.com/hc/en-us/articles/204849977-How-do-I-create-a-server-)
- Create and share [the invite](https://support.discordapp.com/hc/en-us/articles/208866998) with eachother so everyone joins the server 
- If you're on windows 10 and up to date, join the voice channel, [follow this guide](https://support.discordapp.com/hc/en-us/articles/360030714312-Stream-your-game-with-Go-Live-), pick the window you want to stream, and it should just pick up and route the audio properly. If not, keep reading, this is where the real guide begins

### The real guide : Routing the audio of a single window to the stream

#### Overview
- First, we're going to want a virtual way to route output to input, so the sound playing out becomes what plays through the fake "microphone" to the stream. This is where [VB Audio Virtual Cable](https://www.vb-audio.com/Cable/index.htm) comes in. This driver creates a fake audio input and output pair. Anything that plays to the output gets re-reouted to the associated input. So you set your microphone to this input, then play the audio through the output.
- The obvious answer is to make it the default output, but then you can't hear it, and that sucks if the idea is a watch party. So what we'll want to do is route the audio of a single program to the fake output, but keep everything else on our current speakers. This is where [Audio Router](https://github.com/audiorouterdev/audio-router) comes in.
- Once you've found and moved the proper process to the fake output, you can then set "listen to this device" on the fake input to also hear the audio stream, and with that we're done!

#### Step by step
- Download [VB Audio Virtual Cable](https://www.vb-audio.com/Cable/index.htm) 
- Extract the files to a folder
- Run setup **VBCABLE_Setup_x64** as **administrator**
- Click the **Install Driver** button and follow the steps, including rebooting
- Download [Audio Router](https://github.com/audiorouterdev/audio-router/releases/tag/v0.10.2)
- Exract the files to a folder and make a shortcut in your start menu or desktop just to make your life easier
- Run Audio Router, start playing music in the tab/app you want to stream, find it
- Move it to the fake output, you shouldn't hear it anymore
- Open sound properties, confirm the bouncing green line on the fake input. 
- open it's properties, and check "Listen to device". Apply the changes and you should now hear the app/tab again
- Now go ahead and stream, make sure you're using the fake microphone as input, and that you don't mute yourself.

#### *Pictures coming I'm just lazy*





<link rel="stylesheet" type="text/css" href="style.css">
