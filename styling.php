<?php
  $content = $_POST['content'];
  $diatype = isset($_POST['diatype']) ? $_POST['diatype'] : "";

$types = array(
    'label' => 'text',
    'fillColor' => 'col',
    'strokeColor' => 'col',
    'pointColor' => 'col',
    'pointStrokeColor' => 'col',
    'pointHighlightFill' => 'col',
    'pointHighlightStroke' => 'col',
    'highlightFill' => 'col',
    'highlightStroke' => 'col',
    'color' => 'col',
    'highlight' => 'col'

);

?>

<?php if($content == 'getTypes'):

  echo json_encode($types);

elseif($content == 'getProperties'):

  $s = array();
  switch($diatype){

    //CASE A OPTION STYLE
    case 'line':
    case 'radar':
      $s = array('label', 'fillColor', 'strokeColor', 'pointColor', 'pointStrokeColor', 'pointHighlightFill', 'pointHighlightStroke');
      break;
    case 'bar':
      $s = array('label', 'fillColor', 'strokeColor', 'highlightFill', 'highlightStroke');
      break;

    //CASE B OPTION STYLE
    case 'polar':
    case 'pie':
    case 'doughnut':
      $s = array('label', 'color', 'highlight');
      break;

  }

  foreach($s as $item){
    echo '<option value="'.$item.'" stype="'.$types[$item].'">'.$item.'</option>';
  }


 endif; ?>
