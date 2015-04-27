<?php

function getSalt(){
    $salt = "VxDtPASE55vWTAPI07XTvNydBxCyzP3cA29uIYqlfafTe7BcqfBDfDjTBLx2";
}

function addUser($username, $password, $isadmin)
{
    $coll = getCollUsers();
    //check if there isn't already a user with this name
    if ($coll->count(array('username' => $username)) > 0)
        return "ERROR - already existing";
    else {
        $pw_hash = sha1($password.getSalt());
        $coll->insert(array(
            'username' => $username,
            'password' => $pw_hash,
            'isadmin' => $isadmin,
            'ip' => $_SERVER['REMOTE_ADDR'],
            'host' => gethostbyaddr($_SERVER['REMOTE_ADDR']),
            'lastLogin' => new MongoDate()
        ));
        return 'OK';
    }
}

function isAdmin($username){
    $coll = getCollUsers();
    return $coll->count(array(
        'username' => $username,
        'isadmin' => true
    )) > 0;
}

function login($username, $password)
{
    $coll = getCollUsers();
    $pw_hash = sha1($password.getSalt());
    var_dump($pw_hash);
    if ($coll->count(array(
            'username' => $username,
            'password' => $pw_hash
        )) > 0
    ) {
        $newdata = array('$set' => array(
            'ip' => $_SERVER['REMOTE_ADDR'],
            'host' => gethostbyaddr($_SERVER['REMOTE_ADDR']),
            'lastLogin' => new MongoDate()
        ));
        $coll->update(array('username' => $username), $newdata);

        return "OK";
    } else {
        return "ERROR - Wrong username/password";
    }
}

function changeIsAdmin($username, $isAdminNewStatus)
{
    $coll = getCollUsers();
    if ($coll->count(array(
            'username' => $username,
        )) > 0
    ) {

        $newdata = array('$set' => array(
            'isadmin' => $isAdminNewStatus
        ));
        $coll->update(array('username' => $username), $newdata);
        return "OK";

    } else {
        return "ERROR - Wrong username";
    }
}

function changePw($username, $oldpw, $newpw)
{
    $coll = getCollUsers();
    $pw_hash_old = sha1($oldpw.getSalt());
    $pw_hash_new = sha1($newpw.getSalt());
    if ($coll->count(array(
            'username' => $username,
            'password' => $pw_hash_old
        )) > 0
    ) {

        $newdata = array('$set' => array(
            'password' => $pw_hash_new
        ));
        $coll->update(array('username' => $username), $newdata);
        return "OK";

    } else {
        return "ERROR - Wrong username/password";
    }
}

function deleteUser($username)
{
    $coll = getCollUsers();

    $coll->remove(array('username' => $username));
    //if all users are deleted -> insert default one
    if ($coll->count(array()) == 0) {
        $pw_hash = sha1('admin'.getSalt());
        $coll->insert(array(
            'username' => 'admin',
            'password' => $pw_hash,
            'ip' => $_SERVER['REMOTE_ADDR'],
            'host' => gethostbyaddr($_SERVER['REMOTE_ADDR']),
            'lastLogin' => new MongoDate()
        ));
    }
    return "OK";
}

function listUsers()
{
    $coll = getCollUsers();
    $res = array();
    $cursor = $coll->find(array());
    foreach ($cursor as $user) {
        $res[] = array(
            'username' => $user['username'],
            'isadmin' => $user['isadmin'],
            'ip' => $user['ip'],
            'host' => $user['host'],
            'lastLogin' => $user['lastLogin']->sec
        );
    }
    return $res;
}



?>