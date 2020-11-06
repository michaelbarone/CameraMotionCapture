<?php
// get version from github
if (($gitJson = file_get_contents("https://raw.githubusercontent.com/michaelbarone/CameraMotionCapture/main/version.json")) !== false) {
	$gitVersion = json_decode($gitJson, true);
} else {
	echo "Could not get version from github.";
	exit;
}

// get version from local web server
if (($localJson = file_get_contents("./version.json")) !== false) {
	$localVersion = json_decode($localJson, true);
} else {
	echo "No local version file.  Update webserver code from github.";
	exit;
}

// compare local vs git versions
if($gitVersion["version"] == $localVersion["version"]){
	echo "Webserver code up to date";
} else {
	echo "Update Available. Get webserver code from github.";
}
?>