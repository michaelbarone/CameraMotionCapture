<?php
if(!$_GET['events'] || !$_GET['cameraName']) {
	echo "missing required variables"."<br>";
	echo "required variables:"."<br>";
	echo "events"."<br>";
	echo "cameraName"."<br>";
	echo "...exiting";
	exit;
}

$events = $_GET['events'];
$cameraName = $_GET['cameraName'];

$array = explode(',', $events);


foreach($array as $motionTime){
	$dir = '../images/'.$cameraName.'/'.$motionTime;
	rrmdir($dir);
}

function rrmdir($dir) {
	if (is_dir($dir)) {
		$objects = scandir($dir);
		foreach ($objects as $object) {
			if ($object != "." && $object != "..") {
				if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object)){
					rrmdir($dir. DIRECTORY_SEPARATOR .$object);
				} else {
					unlink($dir. DIRECTORY_SEPARATOR .$object);
				}
			}
		}
		rmdir($dir);
	}
}
?>