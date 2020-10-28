<?php
$dir = '../images';

$return_array = array();
if(is_dir($dir)){
    if($dh = opendir($dir)){
        while(($file = readdir($dh)) != false){
            if($file == "." or $file == ".." or $file == "lastMotion.json"){
            } else {
                $return_array[] = $file;
            }
        }
    }
    echo json_encode($return_array);
}
?>