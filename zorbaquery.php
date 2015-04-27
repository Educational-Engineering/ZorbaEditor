<?php
    // include Zorba API
    require_once 'zorba_api_wrapper.php';
    // create Zorba instance in memory
    $ms = InMemoryStore::getInstance();
    $zorba = Zorba::getInstance($ms);

    try {

        if(!isset($_POST['query'])){
          die("No query string found!");
        }

        	$queryString = $_POST['query'];
        	$query = $zorba->compileQuery($queryString);
        	$result = $query->execute();
        	echo $result;


          // clean up
          $query->destroy();
          $zorba->shutdown();
          InMemoryStore::shutdown($ms);

    } catch (Exception $e) {
        die('ERROR:' . $e->getMessage());
    }
?>
