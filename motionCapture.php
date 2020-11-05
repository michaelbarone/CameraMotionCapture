<?php
if(!$_POST || !isset($_POST)) {
	echo "no post variables"."<br>";
	echo "required variables:"."<br>";
	echo "cameralUrl"."<br>";
	echo "cameraName"."<br>";
	echo "...exiting";
	exit;
}

if($_POST['cameraUrl'] == null || $_POST['cameraUrl'] == "" || $_POST['cameraName'] == null || $_POST['cameraName'] == ""){
	echo "cameralUrl or cameraName is not defined properly"."<br>";
	echo "...exiting";
	exit;
}

// set variables to post input
$cameraUrl = $_POST['cameraUrl'];
$cameraName = $_POST['cameraName'];
if(isset($_POST['captureCount']) && $_POST['captureCount'] != null && $_POST['captureCount'] != "" && is_numeric($_POST['captureCount'])){
	$captureCount = $_POST['captureCount'];
} else {
	$captureCount = 5;
}
if(isset($_POST['captureDelay']) && $_POST['captureDelay'] != null && $_POST['captureDelay'] != "" && is_numeric($_POST['captureDelay'])){
	$captureDelay = $_POST['captureDelay'];
} else {
	$captureDelay = 3;
}
if(isset($_POST['username']) && $_POST['username'] != null && $_POST['username'] != ""){
	$username = $_POST['username'];
} else {
	$username = "";
}
if(isset($_POST['password']) && $_POST['password'] != null && $_POST['password'] != ""){
	$password = $_POST['password'];
} else {
	$password = "";
}


// get current timestamp to separate motion events
$timestamp = time()."000";


// create directories if they do not exist
if (!file_exists('./images/'.$cameraName)) {
    mkdir('./images/'.$cameraName, 0777, true);
}
if (!file_exists('./images/'.$cameraName.'/'.$timestamp)) {
    mkdir('./images/'.$cameraName.'/'.$timestamp, 0777, true);
}


// this will bypass ssl and create a potential security vulnerability
// if you want to fix the ssl issue, look here https://stackoverflow.com/questions/26148701/file-get-contents-ssl-operation-failed-with-code-1-failed-to-enable-crypto
// then update the $arrContextOptions array as per the stackoverflow recommendations
$arrContextOptions=array(
    "ssl"=>array(
        "verify_peer"=>false,
        "verify_peer_name"=>false,
    ),
	'http' => array(
		'header' => "Authorization: Basic " . base64_encode("$username:$password")
	)
);

$json = new stdClass();
$json->lastMotion = $timestamp * 1;
$json = json_encode($json);
// save the lastMotion timestamp
file_put_contents("./images/lastMotion.json", $json);

// save the images
$failcount = 0;
for ($i = 0; $i < $captureCount; $i++) {
	$mostRecent = './images/'.$cameraName.'/mostRecent.jpg';
	$location = './images/'.$cameraName.'/'.$timestamp.'/'.time().'000.jpg';
	if (($image = file_get_contents($cameraUrl, false, stream_context_create($arrContextOptions))) !== false) {
		file_put_contents($mostRecent, $image);
		copy($mostRecent, $location);
		if($captureCount>1){
			sleep($captureDelay);
		}
	} else {
		if($failcount > 2) {
			echo "too many fail attempts to get image from camera.";
			break;
		}
		$failcount++;
		$i--;
	}
}
?>