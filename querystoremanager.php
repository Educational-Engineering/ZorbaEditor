<?php
session_start();
include 'mongoConnection.php';

if (!isset($_POST['action'])) {
    die("No Action given!");
}

//check for correct session token
if (!$_SESSION['loggedin']) {
    die("No authenticated request!");
}

$loggedInUsername = $_SESSION['loggedinUsername'];


$coll = getCollQueries();

$showresponse = true;
$response = array();

switch ($_POST['action']) {

    case "createFolder":
        $doc = array('folder' => true, 'fname' => $_POST['fname'], 'owner' => $loggedInUsername);
        $coll->insert($doc);
        $response['status'] = 'OK';
        $response['id'] = "" . $doc['_id'];
        break;

    case "renameFolder":
        if (hasUserAccessRights($_POST['fid'])) {
            $doc = array('folder' => true, 'fname' => $_POST['fname']);
            $coll->update(array('_id' => new MongoId($_POST['fid'])), $doc);
            $response['status'] = 'OK';
            $response['id'] = "" . $_POST['fid'];
        } else {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['Not enough rights'];
        }
        break;

    case "removeFolder":
        if (hasUserAccessRights($_POST['fid'])) {
            //get folder name
            $folder = $coll->findOne(array('_id' => new MongoId($_POST['fid'])));
            //remove queries
            $coll->remove(array('parentfolder' => $folder['fname']));
            //remove folder
            $coll->remove(array('_id' => new MongoId($_POST['fid'])));
            $response['status'] = 'OK';
        } else {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['Not enough rights'];
        }
        break;

    case "jsonFolderList":
        $cursor = $coll->find(array('folder' => true, 'owner' => $loggedInUsername));
        $res = array();
        foreach ($cursor as $fdoc) {
            $res[] = $fdoc['fname'];
        }
        $showresponse = false;
        echo json_encode($res);
        break;

    case "createQuery":

        //create folder if it doesn't exists
        if ($coll->count(array('folder' => true, 'fname' => $_POST['parentfolder'])) == 0) {
            $doc = array('folder' => true, 'fname' => $_POST['parentfolder'], 'owner' => $loggedInUsername);
            $coll->insert($doc);
        }

        $doc = array(
            'qname' => $_POST['qname'],
            'folder' => false,
            'parentFolder' => $_POST['parentfolder'],
            'qcode' => $_POST['qcode'],
            'lastExecution' => new MongoDate(),
            'options' => $_POST['options'],
            'params' => $_POST['params'],
            'owner' => $loggedInUsername
        );
        $coll->insert($doc);
        $response['status'] = 'OK';
        $response['id'] = "" . $doc['_id'];
        break;

    case "updateQuery":

        if (!isset($_POST['qid'])) {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['No ID given'];
        } elseif (!hasUserAccessRights($_POST['qid'])) {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['Not enough rights'];
        }else{
            //create folder if it doesn't exists
            if ($coll->count(array('folder' => true, 'fname' => $_POST['parentfolder'])) == 0) {
                $doc = array('folder' => true, 'fname' => $_POST['parentfolder']);
                $coll->insert($doc);
            }

            $doc = array(
                'qname' => $_POST['qname'],
                'folder' => false,
                'parentFolder' => $_POST['parentfolder'],
                'qcode' => $_POST['qcode'],
                'lastExecution' => new MongoDate(),
                'options' => $_POST['options'],
                'params' => $_POST['params'],
                'owner' => $loggedInUsername
            );
            $coll->update(array('_id' => new MongoId($_POST['qid'])), $doc);
            $response['status'] = 'OK';
            $response['id'] = $_POST['qid'];
        }
        break;

    case "deleteQuery":

        if (!isset($_POST['qid'])) {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['No ID given'];
        } elseif (!hasUserAccessRights($_POST['qid'])) {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['Not enough rights'];
        }else {
            $coll->remove(array('_id' => new MongoId($_POST['qid'])));
            $response['status'] = 'OK';
        }
        break;

    case "getQuery":
        if (!isset($_POST['qid'])) {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['No ID given'];
        }elseif (!hasUserAccessRights($_POST['qid'])) {
            $response['status'] = 'ERROR';
            $response['message'] = $doc['Not enough rights'];
        } else {
            $doc = $coll->findOne(array('_id' => new MongoId($_POST['qid'])));
            $result = array(
                'id' => "" . $doc['_id'],
                'qname' => $doc['qname'],
                'parentFolder' => $doc['parentFolder'],
                'qcode' => $doc['qcode'],
                'options' => $doc['options'],
                'params' => isset($doc['params']) ? $doc['params'] : "[]"
            );
            echo json_encode($result);
            $showresponse = false;
        }
        break;

    case "listQueries":
        $beforeInnerFolder = isset($_POST['beforeInnerFolder']) ? $_POST['beforeInnerFolder'] : "";
        $afterInnerFolder = isset($_POST['afterInnerFolder']) ? $_POST['afterInnerFolder'] : "";
        $beforeInnerQuery = isset($_POST['beforeInnerQuery']) ? $_POST['beforeInnerQuery'] : "";
        $afterInnerQuery = isset($_POST['afterInnerQuery']) ? $_POST['afterInnerQuery'] : "";
        $c1 = $coll->find(array('folder' => true, 'owner' => $loggedInUsername));
        echo "<ul>\n";
        foreach ($c1 as $fdoc) {
            echo "<li>" . $beforeInnerFolder . '<a href="#" qid="' . $fdoc['_id'] . '" >' . $fdoc['fname'] . '</a>' . $afterInnerFolder . "\n<ul>";
            $c2 = $coll->find(array('folder' => false, 'parentFolder' => $fdoc['fname'], 'owner' => $loggedInUsername));
            foreach ($c2 as $qdoc) {
                echo "<li>" . $beforeInnerQuery . '<a href="#" qid="' . $qdoc['_id'] . '" >' . $qdoc['qname'] . '</a>' . $afterInnerQuery . "</li>\n";
            }
            echo "</ul></li>\n";
        }
        echo "<ul>";
        $showresponse = false;
        break;


    /* ## File Functions ## */
    case "listFiles":
        $fcoll = getCollFiles();
        $fcursor = $fcoll->find();
        echo "<ul>";
        foreach ($fcursor as $filedoc) {
            echo "<li><span class=\"glyphicon glyphicon-remove\" /> (" . date('d-M-Y h:i', $filedoc['uploaded']->sec) . ") - <span class=\"fname\">" . $filedoc['filename'] . "</span></li>";
        }
        echo "</ul>";
        $showresponse = false;
        break;

    default:
        $response = array('status' => 'ERROR', 'message' => 'Incorrect Action!', 'postvars' => print_r($_POST));
}

if ($showresponse)
    echo json_encode($response);


function hasUserAccessRights($id)
{
    $loggedInUser = $_SESSION['loggedinUsername'];
    $coll = getCollQueries();
    return $coll->count(array('_id' => new MongoId($id), 'owner' => $loggedInUser)) > 0;
}
