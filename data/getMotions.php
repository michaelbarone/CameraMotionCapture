<?php
if(!$_GET || !isset($_GET)) {
	echo "no GET variables"."<br>";
	echo "required variables:"."<br>";
	echo "cameraName"."<br>";
	echo "...exiting";
	exit;
}
$cameraName = $_GET['cameraName'];

$dir = '../images/'.$cameraName;

$return_array = array();
if(is_dir($dir)){
    if($dh = opendir($dir)){
        while(($file = readdir($dh)) != false){
            if($file == "." or $file == ".." or $file == "mostRecent.jpg"){
            } else {
                $return_array[] = $file;
            }
        }
    }
    echo json_encode($return_array);
}
?>