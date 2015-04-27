<?php
  $content = $_POST['content'];
  $diatype = isset($_POST['diatype']) ? $_POST['diatype'] : "";

?>

<?php if($content == 'getTypes'):

  $types1 = array(
    'label' => 'text',
    'fillColor' => 'col',
    'strokeColor' => 'col',
    'pointColor' => 'col',
    'pointStrokeColor' => 'col',
    'pointHighlightFill' => 'col',
    'pointHighlightStroke' => 'col',
    'highlightFill' => 'col',
    'highlightStroke' => 'col'
  );

  echo json_encode($types1);

elseif($content == 'getProperties'):

  $types = array(
    'label' => 'text',
    'fillColor' => 'col',
    'strokeColor' => 'col',
    'pointColor' => 'col',
    'pointStrokeColor' => 'col',
    'pointHighlightFill' => 'col',
    'pointHighlightStroke' => 'col',
    'highlightFill' => 'col',
    'highlightStroke' => 'col'
  );

  $s = array();
  switch($diatype){

    case 'line':
      $s = array('label', 'fillColor', 'strokeColor', 'pointColor', 'pointStrokeColor', 'pointHighlightFill', 'pointHighlightStroke');
      break;
    case 'bar':
      $s = array('label', 'fillColor', 'strokeColor', 'highlightFill', 'highlightStroke');
      break;
    case 'radar':
      $s = array('label', 'fillColor', 'strokeColor', 'pointColor', 'pointStrokeColor', 'pointHighlightFill', 'pointHighlightStroke');
      break;

  }

  foreach($s as $item){
    echo '<option value="'.$item.'" stype="'.$types[$item].'">'.$item.'</option>';
  }


 endif; ?>
