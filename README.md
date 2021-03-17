# CameraMotionCapture
grab images from IP cameras when motion is triggered


To capture images, send a post to:
[webserver]/CameraMotionCapture/motionCapture.php

Required POST Variables:
```
cameraUrl  --  the direct image url for the camera you want to capture
cameraName --  the name you want to display for this camera
```

Optional POST Variables:
```
username		--  the username for the camera if set (this can be included in the url instead of here)
password		--  the password for the camera if set (this can be included in the url instead of here)
captureCount	--  default 5 --  the number of frames to save when motion is triggered/post is sent to motionCapture.php
captureDelay	--  default 2 --  the number of seconds between saving frames
```


The image save structure is as follows:

[webserver]/CameraMotionCapture/images/[cameraName]/mostRecent.jpg
[webserver]/CameraMotionCapture/images/[cameraName]/[motionTimeStamp]/[imageCaptureTimeStamp].jpg

The mostRecent.jpg will always be the most recent image from that camera.  You can use this to send to devices or refresh on a dashboard to always see the most recent image capture for this camera.

By loading the main/root webpage [webserver]/CameraMotionCapture/  it will automatically load the most recent motion event from any captured camera.  You can also browse all previous motion events for all cameras on this webpage.  Every 5 minutes the webpage will check if there are new motions to load and will automatically switch to the most recent motion event if there have been no interactions on the webpage for just over 3 minutes.

You can view any full event from the camera (all snapshots for that event) by using the following URL:
[webserver]/CameraMotionCapture/?cameraName=[cameraName]&event=#
-[cameraName] is the camera name
-event is the event number you want to view.  0 is the current/most recent event, 1 is the previous event, 2 is the event before 1, etc.  if you specify an event number that does not exist you will get a black page with no images.

when you use event=0, the webapp will automatically search for new images every ~1 second and add any found to the current image rotation.  This way, you can load the event=0 page during an event and new snapshots will load automatically even if they are saved after the page loads.


To remove events manually from the interface, add ?admin to the url and refresh the page:
[webserver]/CameraMotionCapture/?admin

you will now have a toggle 'Delete' button in the upper right corner of the screen.  When toggled 'on', all camera snapshot timestamps and dates will be red.  If you click on any red timestamp or date, it will delete that event or entire day from the webserver.  Remember to turn off 'Delete' when you are done removing the intended events.


You can view live streams of cameras by using the following url format if your camera offers a live stream viewable directly in the browser:
[webserver]/CameraMotionCapture/?live&cameraUrl=[full camera url]
[webserver]/CameraMotionCapture/?live&cameraUrl=http://192.168.1.10/videostream.cgi

if the camera url need its own parameters, add them after the cameraUrl like this:
[webserver]/CameraMotionCapture/?live&cameraUrl=[full camera url]&usr=name&pwd=secret

this will format the cameraUrl to include usr and pwd when it opens the stream, like this:
[full camera url]?usr=name&pwd=secret

you can add as many parameters as your camera needs



## Web hosting requirements:

php with allow_url_fopen enabled

the webserver user will need to be able to write/execute to the /images/ directory


note:
The motionCapture.php file disables SSL to capture from cameras that are ssl only/required.  There are instructions on line 50 of motionCapture.php if you want to enforce ssl.
