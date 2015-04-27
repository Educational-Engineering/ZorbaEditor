var name2Types = {};
var activeRowNo = 1;

$(document).ready(function() {

	$( "#btnqueryexe" ).click(function() {
		executeQuery();
  });

	$.post("styling.php", {
			content: 'baseform'
		})
		.done(function(data) {
			$('#div-styling').html(data);

			var form = $('#styling-form');

			$('#diastyle-apply').click(function(){
				applyStyleClick();
			});

			var diastyleselector = form.find('select[name=diastyle-diatype]');
			diastyleselector.change(function() {
				$.post("styling.php", {
					content: 'getProperties',
					diatype: diastyleselector.val()
				}).done(function(data1) {
					form.find('select[name=diastyle-propchoser]')
					.html(data1);
				});


			});

			form.find('#diastyle-addpropsingle').on('click', function() {
				var propChosen = form.find('select[name=diastyle-propchoser]').val();
				addProp2Table(propChosen, "", name2Types[propChosen]);
			});

			form.find('#diastyle-addpropall').on('click', function() {
				$('#styling-form select[name=diastyle-propchoser] option').each(function() {
						addProp2Table($(this).val(), "", name2Types[$(this).val()]);
					});
			});

			form.find('#diastyle-proptable tr button').on('click', function(event) {
				$(this).parent().parent().remove();
			});


			form.find('#diastyle-adddatarow').on('click', function() {
				var lastRowButton = form.find(
					'#diastyle-datarowbuttons button.datarowbtn:last');
				var rowno = parseInt(lastRowButton.attr('rowno'));
				lastRowButton.after(
					'<button type="button" class="btn btn-default datarowbtn" rowno="' +
					(rowno + 1) + '" id="diastyle-datarow-' + (rowno + 1) +
					'">Data Row ' + (rowno + 1) + '</button>');
					datarowSetupClick();
			});

			datarowSetupClick();

			$.post("styling.php", {	content: 'getTypes'	}).done(function(data) {
					name2Types = JSON.parse(data);
				});



		});


});

function executeQuery(){
	$("#tab1").html(".. Fetching the result. Please wait ..");
	var editor = ace.edit("editor");
	var code = editor.getSession().getValue();
	$.post( "zorbaproxy.php", { query: code })
		.done(function( data ) {
			var s = data;
			// preserve newlines, etc - use valid JSON
			s = s.replace(/\\n/g, "\\n")
			.replace(/\\'/g, "\\'")
			.replace(/\\"/g, '\\"')
			.replace(/\\&/g, "\\&")
			.replace(/\\r/g, "\\r")
			.replace(/\\t/g, "\\t")
			.replace(/\\b/g, "\\b")
			.replace(/\\f/g, "\\f");
			// remove non-printable and other non-valid JSON chars
			s = s.replace(/[\u0000-\u0019]+/g,"");
			//$("#tab1").html(JSON.stringify(JSON.parse(s), null, 4));
			$("#tab1").html("<code>"+s+"</code>");

			$('#tab2link').click();
			qResult = JSON.parse(s);
			setupDiagram(qResult);

		});
}

function applyStyleClick(){
	saveOptionsObjFromDatarow(activeRowNo);
	setupDiagram(qResult);
}

function datarowSetupClick() {
	$('#styling-form').find('#diastyle-datarowbuttons button.datarowbtn').on('click',	function() {
			var oldbtn = $('#styling-form').find('#diastyle-datarowbuttons button.datarowbtn.active');
			oldbtn.removeClass('active');

			//save last one
			var rownoold = parseInt(oldbtn.attr('rowno'));
			saveOptionsObjFromDatarow(rownoold);
			//setup new
			var rownonew = parseInt($(this).attr('rowno'));
			$(this).addClass('active');
			//restore options to new datarow proptable
			restoreDatarowFromOptionsObj(rownonew);
			activeRowNo = rownonew;
	});
}

function saveOptionsObjFromDatarow(rowno){
	var opt = getOptionObjFromDatarow(rowno);
	qChartDataOptions.datasets[rowno-1] = opt;
}

function restoreDatarowFromOptionsObj(rowno){
	$('#styling-form #diastyle-proptable tr').not(':first').remove();
	if(qChartDataOptions.datasets.length>(rowno-1)){
		opt = qChartDataOptions.datasets[rowno-1];
		for(var propname in opt){
			addProp2Table(propname, opt[propname], name2Types[propname]);
		}
	}
}

function getOptionObjFromDatarow(rowno){
	var o = {};
	$('#styling-form #diastyle-proptable tr').each(function(){
		var propname = $(this).find('td').first().text();
		var propinput = $(this).find('input[name=diastyle-proptable-' + propname+']');
		var propval = "";
		if(propname != ""){
			if(propinput.hasClass('spectrum'))
				propval = propinput.spectrum('get').toRgbString();
			else
				propval = propinput.val();

			o[propname] = propval;
		}
	});
	return o;
}

function setupDiagram(qdata){
	var ddata = qChartDataOptions;
	ddata.labels = getColFromJSON(qdata, 'label')
	for(var dd in ddata.datasets){
		var dataColInt = parseInt(dd)+1;
		var dataArrayCol = getColFromJSON(qdata, 'data'+dataColInt);
		if(dataArrayCol.length > 0 && dd >= 0 && !(typeof dataArrayCol[0] === 'undefined'))
			ddata.datasets[dd]['data'] = dataArrayCol;
	}

	var chart1 = document.getElementById('myChart').getContext('2d');
	if(activeChart != null)
		activeChart.destroy();

	var diaType = $('#styling-form select[name=diastyle-diatype]').val();

	if(diaType == 'line')
		activeChart = new Chart(chart1).Line(ddata, '{}');
	else if(diaType == 'bar')
		activeChart = new Chart(chart1).Bar(ddata, '{}');
	else if(diaType == 'radar')
		activeChart = new Chart(chart1).Radar(ddata, '{}');
}

function addProp2Table(name, val, type) {
	//don't add if its already there
	if ($('#styling-form #diastyle-proptable tr').filter(function() {
			return $(this).children().first().text() == name;
		}).length == 0) {
		var tt = $('#styling-form #diastyle-proptable tr:last');

		var idname = 'diastyle-proptable-' + name;

		var input = "";
		if (type == 'col')
			input = '<input type="text" id="' + idname + '" name="' + idname +'" class="spectrum" ></input>';
		if (type == 'text')
			input = '<input type="text" id="' + idname + '" name="' + idname +'" value="'+val+'"></input>';

		tt.after('<tr><td>' + name + '</td><td>' + input + '</td><td><button type="button" class="btn btn-default"><span class="glyphicon glyphicon-remove" /></button></td></tr>'
		);
		$('#styling-form #diastyle-proptable tr button').on('click', function(event) {
			$(this).parent().parent().remove();
		});
		if (type == 'col'){
			$('#'+idname).spectrum({
			    color: val,
					preferredFormat: "hex",
					showInput: true,
					showAlpha : true
			});
		}
	}
}

function getColFromJSON(data, colname){
  var res = [];
  var i;
  for(i = 0; i < data.length; i++){
    res[res.length] = data[i][colname];
  }
  return res;
}

function buildUpDatasetA(data, names){
  var res = {
    labels : getColFromJSON(data, 'label'),
    datasets : [
      {
        label : names[0],
        fillColor: "rgba(22,22,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data : getColFromJSON(data, 'data1')
      }
    ]
  };
  return res;
}
