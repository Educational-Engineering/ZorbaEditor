<?php
ini_set('max_execution_time', 0);
$listofall = array();
for($i = 1011000; $i < 1012000; $i++){
    $pageURL = "http://migipedia.migros.ch/de/".$i."00000";
    //echo $pageURL."\n";
    $f = file_get_contents($pageURL);
    $notFound = strpos($f, "Das gewünschte Produkt konnte nicht gefunden werden oder existiert nicht mehr");
    //echo "NOT_FOUND: ".($notFound ? 'true' : 'false')."\n";

    if(!$notFound){

        libxml_use_internal_errors(true);
        $doc = new DOMDocument();
        $doc->loadHTML($f);
        //echo "mumsidi";

        //foreach ($doc->getElementsByTagName("span") as $tag){


            $xp = new DOMXpath($doc);

            $resJSON = array(
                'artikelnr' => $i."00000",
                'pageurl' => $pageURL
              //  'serverurl' => "https://migros-cache.fsi-viewer.com/fsicache/server?type=image&source=images%2Fmigros_api%2Fproduct_".$i."00000.jpg&width=100&height=50&renderer=original"
               );

            //Name of Product
            foreach($xp->query('//*[contains(@class, \'maintitle\')]') as $result){
               // print_r($result);
                $s1 = trim(preg_replace('/\s+/', ' ', $result->nodeValue));
                $resJSON['name'] = $s1;
            }

            //EAN_ScanNumber
            foreach($xp->query('//*[contains(@id, \'productdata\')]') as $result){
                //print_r($result);
                $full = trim(preg_replace('/\s+/', ' ', $result->nodeValue));
                $posGTIN = strpos($full, "GTIN");
                $posAN = strpos($full, "Artikelnummer");
                $sub1 = substr($full, $posGTIN+4, $posAN-$posGTIN-5);
                $gtins = explode(',',$sub1);

                $resJSON['barcode'] = array();
                foreach($gtins as $barcodeSingle){
                    $s1 = trim(preg_replace('/\s+/', ' ', $barcodeSingle));
                    $resJSON['barcode'][] = $s1;
                }
            }
            //Selling-Unit
            foreach($xp->query('//*[contains(@class, \'selling-unit\')]') as $result){
              //  print_r($result);
                $s1 = trim(preg_replace('/\s+/', ' ', $result->nodeValue));
                $resJSON['sellingunit'] = $s1;
            }
            //Price_Tag
            foreach($xp->query('//*[contains(@class, \'current-price\')]') as $result){
              //  print_r($result);
                $s1 = trim(preg_replace('/\s+/', ' ', $result->nodeValue));
                $resJSON['price'] = $s1;
            }

            echo json_encode($resJSON)."\n";
            $listofall[] = $resJSON;
    }
}
echo json_encode($listofall);
?>
