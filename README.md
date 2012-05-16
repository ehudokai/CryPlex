CryPlex
=======

An HTML5 based Chrome client for plex media server

This code is designed to work with a Chrome Browser.  
At the time of this writing it is being developed and tested using Chrome version 18.0.1025.168

At this point it is not completely working.

What Works
----------
1. Pulling up server lists from my.plexapp.com using your myPlex login.
1. Selecting server should pull up and allow you to traverse into your Plex library.
1. VERY basic UI

TODO
----
1. media detection/play button
1. using media links to beautify UI and make it look more consistent with most Plex Client UI's
1. improved server access/traversal code
1. Abillity to add custom servers without need for a myPlex account

Why?
----
I did this project partially because I wanted a way to watch content off my plex media server on my Google CR-48 Chromebook.
I still haven't quite gotten it to the point where its fully functioning, so I have yet to use it for this purpose.

I also wanted to write it and make it open source because I found it a little difficult to track down much documentation on how to write
a client for the Plex Media Server.  I still haven't figured everything out as can be seen in the list below.

Things to figure out
--------------------
1. How to change (if possible) the transfer rate of the media coming from the plex server.
1. Better determine the media type.
1. Better documentation/understanding of the Plex transcoder