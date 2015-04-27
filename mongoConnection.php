<?php

function getDB(){
    $mdb = new MongoClient( "mongodb://52.28.54.81:27017" );
    $db = $mdb->zorbaeditor;
    return $db;
}

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