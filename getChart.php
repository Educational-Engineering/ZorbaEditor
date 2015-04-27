<?php
include 'mongoConnection.php';

$coll = getCollQueries();

$qid = $_GET['qid'];
$doc = $coll->findOne(array('_id' => new MongoId($qid)));


$chartOptions = isset($doc['options']['chartdata']) ? $doc['options']['chartdata'] : null;
$showlegend = isset($_GET['showlegend']) ? filter_var($_GET['showlegend'], FILTER_VALIDATE_BOOLEAN) : false;
$usecached = true;
if(isset($_GET['usecached']))
    $usecached = filter_var($_GET['usecached'], FILTER_VALIDATE_BOOLEAN);

//detect based on mongodb-record if we have to refresh based on cache
$lastExecution = new DateTime();
$lastExecution = date_timestamp_set($lastExecution, $doc['lastExecution']->sec);
$now = new DateTime(date("Y-m-d H:i:s"));
$maxCacheTTL = $doc['options']['caching'];
$diff = $now->getTimestamp() - $lastExecution->getTimestamp();
//echo "DIFF IS: ".($diff / 60);
if($diff / 60 > $maxCacheTTL)
    $usecached = false;

if($usecached){

    //nothing to do

}else{

    $qresult = executeQuery($doc['qcode'], $doc['params']);
    //do we have existing chartOptions? if not set sample data
    if($chartOptions == null)
        $chartOptions = getExampleQChartDataOptions(1);

    //now update the chart options with the data from the query
    $chartOptions = getChartDataOptionsFromQueryResult($qresult, $chartOptions);

    //update the chartdata in the mongodb
    $newdata = array('$set' => array(
        'options.chartdata' => $chartOptions,
        'lastExecution' => new MongoDate()
    ));
    $coll->update(array('_id' => new MongoId($doc['_id'])), $newdata);

}

//var_dump($chartOptions);

$width  = isset($_GET['width'])  ? $_GET['width']  : 400;
$height = isset($_GET['height']) ? $_GET['height'] : 400;

function executeQuery($qcode, $params){

    //params replacing
    if($params != null && count($params) > 0) {
        foreach ($params as $param) {
            $replace = isset($_GET[$param['name']]) ? $_GET[$param['name']] : $param['default'];
            $qcode = str_replace('##' . $param['name'] . '##', $replace, $qcode);
        }
    }

    //direct execution
    $url = 'http://52.28.54.81/zorbaquery.php';
    $data = array('query' => $qcode);
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ),
    );
    $context  = stream_context_create($options);
    $qresult = file_get_contents($url, false, $context);
    $qresult = preg_replace( "/\r|\n/", "", $qresult );

    return $qresult;
}
function getChartDataOptionsFromQueryResult($qresult, $ddata){
    $resObj = json_decode($qresult, true);

    if(!isset($ddata['labels']))
        $ddata['labels'] = array();

    $ddata['labels'] = getColFromJSON($resObj, 'label');
    for($i = 0; $i < count($ddata['datasets']); $i++) {
        $dataColInt = $i + 1;
        $dataArrayCol = getColFromJSON($resObj, 'data'.$dataColInt);
        if (count($dataArrayCol) > 0)
            $ddata['datasets'][$i]['data'] = $dataArrayCol;
    }
    return $ddata;
}
function getColFromJSON($qresObj, $colname){
    $res = array();
    for($i = 0; $i < count($qresObj); $i++){
        $res[] = $qresObj[$i][$colname];
    }
    return $res;
}
function getExampleQChartDataOptions($rows){
    $qChartDataOptions = array(
            'labels' => array(),
            'datasets' => array()
            );
        for($i = 0; $i < $rows; $i++){
            $qChartDataOptions['datasets'][$i] = array(
                'data' => array(),
                'label' => ('data'+$i),
                'fillColor' => getRandomCol()
            );
        }

    return $qChartDataOptions;
}
function getRandomCol(){
    return 'rgba('.rand(0,255).','.rand(0,255).','.rand(0,255).',0.5)';
}

?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo $doc['qname']; ?></title>
</head>

<script type='text/javascript' src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script type='text/javascript' src="js/Chart.js"></script>

<link href="css/chartlegend.css" rel="stylesheet">

<script type='text/javascript'>

    $( document ).ready(function() {
        var diaType = "<?php echo $doc['options']['charttyp']?>";
        var dataOptions = JSON.parse('<?php echo json_encode($chartOptions); ?>');
        setupDiagram(diaType, dataOptions);
    });

    function setupDiagram(diaType, ddata){

        var options = { legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\">&nbsp;</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"};

        var chart1 = document.getElementById('myChart').getContext('2d');
        var activeChart;
        if(diaType == 'line')
            activeChart = new Chart(chart1).Line(ddata, options);
        else if(diaType == 'bar')
            activeChart = new Chart(chart1).Bar(ddata, options);
        else if(diaType == 'radar')
            activeChart = new Chart(chart1).Radar(ddata, options);
        else
            activeChart = new Chart(chart1).Line(ddata, options);

        <?php if($showlegend): ?>
            var legend = activeChart.generateLegend();
            $('#legend').append(legend);
        <?php endif; ?>
    }
</script>

<body>


<canvas id="myChart" width="<?php echo $width; ?>" height="<?php echo $height; ?>">

</canvas>
<?php if($showlegend): ?>
<div id="legend" >

</div>
<?php endif; ?>


</body>

</html>