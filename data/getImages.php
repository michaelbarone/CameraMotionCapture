<?php
$cameraName = $_GET['cameraName'];
$motionTime = $_GET['motionTime'];

$dir = '../images/'.$cameraName.'/'.$motionTime;

$return_array = array();
if(is_dir($dir)){
    if($dh = opendir($dir)){
        while(($file = readdir($dh)) != false){
            if($file == "." or $file == ".."){
            } else {
                $return_array[] = $file;
            }
        }
    }
    echo json_encode($return_array);
}
?>