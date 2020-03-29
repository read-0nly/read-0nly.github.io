## Original challenge description

This time, there’s no theme. It’s a straight up challenge.

We challenge you to make something using a container, whether that be a can, bottle, jar, whatever! Do whatever you want! Just be sure you can adequately claim you used a container.

The deadline is April 10! Remember, you can interpret the challenge in any way you want!

## Concept

Make everything a container

## Overview

This script takes a file, and creates an "Alternate data stream" on that file, then gives you tools with which to store information in that stream through its interface. This takes advantage of a feature of the Microsoft NTFS file system - the file table identifies the streams associated with a file. The file content or data as we understand it regularly is in the $DATA stream. 

Alternate streams can be attached to this file location though - for instance, this is used to identify files that were downloaded from untrusted locations so windows can warn you when you try to open them. These alternate streams are also part of the file, but they exist outside of the file's $DATA - the file's $DATA is what gets access, for instance, if you open a file in a program, or upload it. This makes Alternate Data Streams a sort of volatile, file-specific container. The data exists in the file, but if the file is opened or manipulated through regular means, the data's invisible, and if the file is moved through the internet, the data is lost in the process. It makes for data that can only be reasonably accessed, manipulated, and transferred locally.

## How it sticks to the theme

With this, any file on your computer becomes a container for a hidden cache of information, organized itself in a structure of nested hashtables (really, a fancy way of saying containers within containers). Instead of making something out of containers, this turns everything into containers that are themselves filled with as many containers filled with containers as you could want.

## The script itself

I'm publishing this page now because technically, this is "feature complete" - it makes a container and lets you store text in it in a custom, eversprawling structure of containers within containers and it lets you delete any container and deletes the sub containers. 

[The Code](https://github.com/read-0nly/read-0nly.github.io/blob/master/Challenges/AniSoc/Apr2020-Container/ContainerChallenge.ps1)

## Changelog
### 3/29/2020
- Releasing first functional copy, with hardcoded paths and all. All the base function works
- Wishlist
  - Using **Add** and **Del** lets you overwrite keys but you lose the substructure. Finish **Set**
  - Add mediatypes - text, images, video, audio, scripts
  - Text Formatting Syntax (color, bold, blink)
  - GUI
