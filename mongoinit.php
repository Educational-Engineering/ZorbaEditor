<?php
include 'mongoConnection.php';
include 'usermanager.php';

$mdb = getClient();
$db = $mdb->zorbaeditor;

$db->createCollection ("queries");
$db->createCollection ("files");
$db->createCollection ("users");

$coll = getCollUsers();
if($coll->count(array()) == 0) {
    addUser('admin', 'admin', true);
    addUser('user', 'user', false);
    echo "<h1>Added Initial users</h1>";
}else{
    echo "<h1>User Table not empty!!</h1>";
}

?>

