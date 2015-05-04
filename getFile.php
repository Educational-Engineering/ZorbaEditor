<?php
include 'mongoConnection.php';
/*
if($_SERVER['SERVER_ADDR'] != $_SERVER['REMOTE_ADDR']){
    die('No Remote Access Allowed: '.$_SERVER['SERVER_ADDR'].' vs. '.$_SERVER['REMOTE_ADDR']);
}
*/
$coll = getCollFiles();

$secret = $_GET['secret'];
$filename = $_GET['filename'];

$doc = $coll->findOne(array('secret' => $secret, 'filename' => $filename));

if($doc == null){
    die("FILE NOT FOUND / NOT AUTHORIZED !");
}else{
    header('Content-Type: text/plain; charset=utf-8');
    echo $doc['content'];
}

?>
