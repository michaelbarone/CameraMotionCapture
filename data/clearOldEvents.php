<?php
if(!$_POST || !isset($_POST)) {
	echo "no post variables"."<br>";
	echo "required variables:"."<br>";
	echo "daysToKeep"."<br>";
	echo "...exiting";
	exit;
}


// set variables to post input
$daysToKeep = $_POST['daysToKeep'];
if(isset($_POST['cameraName'])){
	$cameraName = $_POST['cameraName'];
} else {
	$cameraName = "";
}



// get current timestamp to separate motion events
$timestamp = time()."000";

// purge events before this timestamp:
$purgeBefore = $timestamp - ($daysToKeep * (1000*60*60*24));

//echo $purgeBefore . PHP_EOL;

$dir = '..' . DIRECTORY_SEPARATOR . 'images';
if($cameraName != ""){
	checkCameraEvents($cameraName,$purgeBefore);
} else {
	if(is_dir($dir)){
		if($dh = opendir($dir)){
			while(($file = readdir($dh)) != false){
				if($file == "." or $file == ".." or $file == "lastMotion.json" or $file == ".gitkeep"){
				} else {
					checkCameraEvents($file,$purgeBefore);
				}
			}
		}
	}
}

function checkCameraEvents($camera,$purgeBefore){
	//echo $camera . PHP_EOL;
	$dir = '..' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . $camera;
	$eventCount = 0;
	if (is_dir($dir)) {
		$objects = scandir($dir);
		foreach ($objects as $object) {
			if ($object != "." && $object != "..") {
				if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object)){
					if($object < $purgeBefore){
						//echo "directory " . $dir. DIRECTORY_SEPARATOR .$object . PHP_EOL;
						rrmdir($dir. DIRECTORY_SEPARATOR .$object);
					} else {
						$eventCount++;
					}
				}
			}
		}
		if($eventCount==0){
			//echo "No events Left in folder: " . $dir . PHP_EOL;
			rrmdir($dir);
		}
	}
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