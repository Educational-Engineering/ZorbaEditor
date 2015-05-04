<?php
include 'mongoConnection.php';
session_start();

$coll = getCollFiles();

$allowedMimes = array('application/vnd.ms-excel','text/plain','text/csv','text/tsv');
$randomstring = $string = str_replace(',', '', strtr(base64_encode(openssl_random_pseudo_bytes(4)), '+/=', '-_,'));
$owner = $_SESSION['loggedinUsername'];
if (!empty($_FILES)) {
    if(in_array($_FILES['file']['type'], $allowedMimes)) {
        $tempFile = $_FILES['file']['tmp_name'];
        $filecontent = file_get_contents($tempFile);

        $coll->insert(array(
            'filename' => $_FILES['file']['name'],
            'secret' => $randomstring,
            'content' => $filecontent,
            'owner' => $owner,
            'uploaded' => new MongoDate()
        ));
    }
}
?>
