<?php

function getProxyURL(){
    return 'http://'.$_SERVER['SERVER_NAME'].'/editor/zorbaquery.php';
}

function getClient(){
    return new MongoClient( "mongodb://".$_SERVER['SERVER_NAME'].":27017" );
}

function getDB(){
    //$mdb = new MongoClient( "mongodb://52.28.54.81:27017" );
    $mdb = getClient();
    $db = $mdb->zorbaeditor;
    return $db;
}

//function getZorbaProxyURL(){
//    return 'http://52.28.54.81/zorbaquery.php';
//}

function getCollQueries(){
    $coll = getDB()->queries;
    return $coll;
}

function getCollUsers(){
    $coll = getDB()->users;
    return $coll;
}

function getCollFiles(){
    $coll = getDB()->files;
    return $coll;
}


?>