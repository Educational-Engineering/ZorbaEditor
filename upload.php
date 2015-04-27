<?php
$ds          = DIRECTORY_SEPARATOR;
$storeFolder = 'uploads';
if (!empty($_FILES)) {
    $tempFile = $_FILES['file']['tmp_name'];
    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds;
    $targetFile =  $targetPath. $_FILES['file']['name'];
    move_uploaded_file($tempFile,$targetFile);
    echo "moved from: ".$tempFile." to: ".$targetFile;

    $mdb = new MongoClient( "mongodb://52.28.54.81:27017" );
    $db = $mdb->zorbaeditor;
    $fcoll = $db->files;
    $fcoll->insert(array(
      'filename' => $_FILES['file']['name'],
      'uploaded' => new MongoDate()
    ));
}
?>
