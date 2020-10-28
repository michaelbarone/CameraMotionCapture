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
captureCount  --  default 5 --  the number of frames to save when motion is triggered/post is sent to motionCapture.php
captureDelay  --  default 3 --  the number of seconds between saving frames
```


The image save structure is as follows:

/CameraMotionCapture/images/[cameraName]/mostRecent.jpg
/CameraMotionCapture/images/[cameraName]/[motionTimeStamp]/[imageCaptureTimeStamp].jpg

The mostRecent.jpg will always be the most recent image from that camera.  You can use this to send to devices or refresh on a dashboard to always see the most recent image capture for this camera.

By loading the main/root webpage [webserver]/CameraMotionCapture/  it will automatically load the most recent motion event from any captured camera.  You can also browse all previous motion events for all cameras on this webpage.  Every 5 minutes the webpage will check if there are new motions to load and will automatically switch to the most recent motion event if there have been no interactions on the webpage for just over 3 minutes.


## Web hosting requirements:

php with file_put_contents enabled

the webserver will need to be able to write to the /images/ directory


note:
The motionCapture.php file disables SSL to capture from cameras that are ssl only/required.  There are instructions on line 40 of motionCapture.php if you want to enforce ssl.
