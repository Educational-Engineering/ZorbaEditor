<?php

include 'usermanager.php';

$mdb = new MongoClient( "mongodb://".$_SERVER['SERVER_NAME'].":27017" );
$db = $mdb->zorbaeditor;

$db->createCollection ("queries");
$db->createCollection ("files");
$db->createCollection ("users");

addUser('admin', 'admin', true);
addUser('user', 'user', false);

?>

