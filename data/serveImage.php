<?php
//print_r($_GET['image']);

$image = $_GET['image'];

require './pathConstants.php';

$dir = $images . "\\";


$imagePartArray = explode(".", $image);
$imagePart = end($imagePartArray);
//print($imagePart);


$file = $dir . $image;


switch($imagePart) {
	case "tif":
		$imagePart="tiff";
		break;
		
	case "jpeg":
	case "jpg":
		$imagePart="jpeg";
		break;

}

$type = 'image/' . $imagePart;
header('Content-Type:' . $type);
header('Content-Length: ' . filesize($file));
$img = file_get_contents($file);
echo $img;

exit();



?>
