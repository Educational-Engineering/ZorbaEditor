//global vars
var activeChart = null;
var qChartDataOptions = {};
var qResult = "";
var activeQID = "";
//typeahead
var substringMatcher;
var fnames = [];
//styling
var name2Types = {};
var activeRowNo = 1;
var actualRowCount = 1;



// do at startup

$( document ).ready(function() {

  // init clickable buttons / links
      $('#action-deletequery').on('click', function(){
        deleteQuery(activeQID);
      });
      $('#action-savequery').on('click', function(){
        saveQuery();
      });
    $('#action-savequery2').on('click', function(){
        saveQuery();
    });
      $('#action-refreshquerylist').on('click', function(){
        refreshSavedQueries();
      });
    $('#action-addnewquery').on('click', function(){
        addNewQuery();
    });
    $('#action-executequery').on('click', function(){
        executeQuery();
    });
    $('#action-checkimport').on('click', function(){
        addImportStatements();
    });
    $('#action-diastyleapply').on('click', function(){
        applyStyleClick();
    });
    $('#action-diastylereset').on('click', function(){
        resetStyle2DefaultClick();
    });

  //modals

    prepareTypeahead();
  refreshSavedQueries();
  setExpandableAnimations();
    initModals();
    resetQChartDataOptions();
    initStylingForm();
    initParamsForm();
    setExampleQChartDataOptions(1);
});












// animations & other behaviour

function setExpandableAnimations() {
    $('h4.expandable').on('click', function (e) {
        var content = $(this).next();
        if ($(this).hasClass('expanded')) {
            $(this).removeClass('expanded').addClass('notexpanded');
            $(this).find('span.glyphicon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
            content.hide('fast');
        }
        else {
            $(this).removeClass('notexpanded').addClass('expanded');
            $(this).find('span.glyphicon').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
            content.show('fast');
        }
    });
}

function prepareTypeahead(){
    substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substrRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push({ value: str });
                }
            });

            cb(matches);
        };
    };
    refreshTypeaheadFolders();

}

function refreshTypeaheadFolders(){
    $.post( "querystoremanager.php", { action: 'jsonFolderList' })
        .done(function( data ) {
            fnames = JSON.parse(data);
            $('.typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'fnames',
                    displayKey: 'value',
                    source: substringMatcher(fnames)
                });
        });
}


// ## USER Click ACTIONS  ##

function refreshSavedQueries(){
  var postdata = {
    action: 'listQueries',
    beforeInnerFolder :  '<span class="glyphicon glyphicon-menu-down expandicon1"></span>&nbsp;&nbsp;',
    afterInnerFolder:    '<span class="removeicon1 glyphicon glyphicon-remove"></span>&nbsp;&nbsp;<span class="renameicon1 glyphicon glyphicon-pencil"></span>',
    beforeInnerQuery:    '',
    afterInnerQuery:     '<span class="removeicon2 glyphicon glyphicon-remove"></span>'
  };
  $.post( "querystoremanager.php", postdata).done(function( data ) {
      $('#querylist').html(data);


      $('.tree li:has(ul)').addClass('parent_li').find(' > span.expandicon1').attr('title', 'Collapse this branch');
      $('.tree li.parent_li > span.expandicon1').on('click', function (e) {
          var children = $(this).parent('li.parent_li').find(' > ul > li');
          if (children.is(":visible")) {
              children.hide('fast');
              $(this).attr('title', 'Expand this branch').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
          } else {
              children.show('fast');
              $(this).attr('title', 'Collapse this branch').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
          }
          e.stopPropagation();
      });

      $('#querylist ul li ul li a').click(function(){
        var qid = $(this).attr("qid");
        loadQuery(qid);
      });

      $('#querylist ul li span.renameicon1').click(function(){
        var alink = $(this).prev().prev();
        var qid =alink.attr("qid");
        $('.bs-folderrename-modal-lg').modal('show');
        $('.bs-folderrename-modal-lg form input[name=folderrename-foldername]').val(alink.text());
        $('#modal-folderrename-submit').on('click', function(){
          var form = $('#modal-folderrename-form');
          var newName = form.find('input[name=folderrename-foldername]').val();
          renameFolder(qid, newName);
        });

      });

      $('#querylist ul li span.removeicon1').click(function(){
        var alink = $(this).prev();
        var qid =alink.attr("qid");
        deleteFolder(qid);
      });

      $('#querylist ul li ul li span.removeicon2').click(function(){
        var alink = $(this).prev();
        var qid =alink.attr("qid");
        deleteQuery(qid);
      });

    });
}

function initModals(){
    $('#modal-mongodb-submit').on('click', function(){
        var baseForm = $('#modal-mongodb-form');
        var host = baseForm.find('input[name=host]').val();
        var user = baseForm.find('input[name=user]').val();
        var usersource = baseForm.find('input[name=usersource]').val();
        var pwd = baseForm.find('input[name=pwd]').val();
        var coll = baseForm.find('input[name=collection]').val();

        var insertText = 'let $s1 := mongo2:query({\n"host":"'+host+'",\n"user":"'+user+'",\n"userSource" : "'+usersource+'",\n"pwd" : "'+pwd+'"},\n"'+coll+'",\n"{##QUERY##}")';

        var editor = ace.edit("editor");
        editor.insert(insertText);
        $('.bs-mongodb-modal-lg').modal('hide');

    });

    $('#modal-jdbc-submit').on('click', function(){
        var baseForm = $('#modal-jdbc-form');
        var host = baseForm.find('input[name=host]').val();
        var user = baseForm.find('input[name=user]').val();
        var pwd = baseForm.find('input[name=pwd]').val();
        var db = baseForm.find('input[name=db]').val();

        var insertText = 'let $con := jdbc:connect({ \n"url": "jdbc:mysql://'+host+'/",\n"user" : "'+user+'",\n"password" : "'+pwd+'"\n}); ';
        var insertText2 = 'jdbc:execute-query($con, "##QUERY##")';
        var editor = ace.edit("editor");
        editor.insert(insertText);
        $('.bs-jdbc-modal-lg').modal('hide');
    });

    $.post( "querystoremanager.php", { action: 'listFiles' })
        .done(function( data ) {
            $("#modal-upload-files").html(data);
            $("#modal-upload-files li span.fname").click(function() {
                var filename = $(this).text();
                var editor = ace.edit("editor");
                editor.insert(filename);
            });
            $("#modal-upload-files li span.glyphicon-remove").click(function() {
                var filename = $(this).parent().children('span.fname').text();
                alert("delete: "+filename);
            });
        });
}


// Query actions

function addNewQuery(){
    //TODO: check for currently active query
    activeQID = "";
    clearForms();
    var newNameQuery ="New Query";
    var newNameFolder = "undefined";
    setQueryTitle(newNameQuery);
    $('#queryopt-form input[name=queryopt-qname]').val(newNameQuery);
    $('#queryopt-form input[name=queryopt-fname]').val(newNameFolder);
}

function saveQuery(){
    var eQueryName = $('#queryopt-form input[name=queryopt-qname]').val();
    var eFolderName = $('#queryopt-form input[name=queryopt-fname]').val();
    if(eQueryName != "" && eFolderName != "") {
        var isNewQuery = activeQID == "";
        var editor = getEditor();
        var postdata = {
            action: isNewQuery ? 'createQuery' : 'updateQuery',
            qid: activeQID,
            qname: $('#queryopt-form input[name=queryopt-qname]').val(),
            parentfolder: $('#queryopt-form input[name=queryopt-fname]').val(),
            qcode: editor.getValue(),
            params : getParamsFromPTable(),
            options: {
                'caching': $('#queryopt-form select[name=queryopt-refresh]').val(),
                'refresh': $('#queryopt-form select[name=queryopt-caching]').val(),
                'chartdata': qChartDataOptions,
                'charttyp' : $('#styling-form select[name=diastyle-diatype]').val()

            }
        };

        $.post("querystoremanager.php", postdata).done(function (data) {
            var data2 = JSON.parse(data);
            if (data2.status == 'OK')
                setAlert('info', "Query was saved");
            else
                setAlert('danger', "Query couldn't be saved: " + data2.message);

            refreshTypeaheadFolders();
        });
    }else{
        alert("No Queryname or Foldername given. Please fix.");
    }
}

function loadQuery(qid){
  var postdata = {
    action : 'getQuery',
    qid : qid
  };
  $.post( "querystoremanager.php", postdata).done(function( data ) {
      var editor = getEditor();
      var dataObj = JSON.parse(data);
      editor.setValue(dataObj.qcode);
      activeQID = dataObj.id;
      setQueryTitle(dataObj.qname);
      $('#queryopt-form input[name=queryopt-qname]').val(dataObj.qname);
      $('#queryopt-form input[name=queryopt-fname]').val(dataObj.parentFolder);
      $('#queryopt-form select[name=queryopt-refresh]').val(dataObj.options.refresh);
      $('#queryopt-form select[name=queryopt-caching]').val(dataObj.options.caching);
      $('#styling-form select[name=diastyle-diatype]').val(dataObj.options.charttyp);

      qChartDataOptions = dataObj.options.chartdata;
      var rowcount = 1;
      if(typeof qChartDataOptions === 'undefined' || qChartDataOptions.datasets.length <= 1){
          setExampleQChartDataOptions(1);
          rowcount = 1;
      }else{
          rowcount = qChartDataOptions.datasets.length
      }

      setDataRowsTo(rowcount);
      var oldbtn = $('#styling-form #diastyle-datarowbuttons button.datarowbtn.active').removeClass('active');
      $('#styling-form #diastyle-datarowbuttons button.datarowbtn[rowno=1]').addClass('active');
      loadChartProperties();
      restoreDatarowFromOptionsObj(1);
      activeRowNo = 1;
      setParams(dataObj.params);
      setEmbedLink(dataObj.id, dataObj.params);
  });
}

function deleteQuery(qid){
  if(qid != ""){
    if(confirm("Do you really want to delete this query?")){
      var postdata = {
        action : 'deleteQuery',
        qid : qid
      };
      $.post( "querystoremanager.php", postdata).done(function( data ) {
          var data2 = JSON.parse(data);
          if(data2.status == 'OK'){
            setAlert('info', "Query was saved");
            activeQID = "";
            refreshSavedQueries();
            //TODO: reset all fields
          }else
            setAlert('danger', "Query couldn't be saved: "+data2.message);
      });
    }
  }
}

function deleteFolder(fid){
  if(fid != ""){
    if(confirm("Do you really want to delete this folder with all of its children?")){
      var postdata = {
        action : 'removeFolder',
        fid : fid
      };
      $.post( "querystoremanager.php", postdata).done(function( data ) {
          var data2 = JSON.parse(data);
          if(data2.status == 'OK'){
            setAlert('info', "Folder was removed");
            refreshSavedQueries();
          }else
            setAlert('danger', "Folder couldn't be removed: "+data2.message);


          refreshTypeaheadFolders();
      });
    }
  }
}

function renameFolder(fid, newName){
  var postdata = {
    action : 'renameFolder',
    fid : fid,
    fname: newName
  };
  $.post( "querystoremanager.php", postdata).done(function( data ) {
    var data2 = JSON.parse(data);
    if(data2.status == 'OK'){
      setAlert('info', "Folder was renamed");
      refreshSavedQueries();
    }else{
      setAlert('danger', "Folder couldn't be renamed: "+data2.message);
    }
    $('.bs-folderrename-modal-lg').modal('hide');
      refreshTypeaheadFolders();
  });

}


// QUERY Execution & Styling
function paramReplace(query){
    var params = getParamsFromPTable();
    for(var i = 0; i < params.length; i++){
        query = query.replace('##'+params[i].name+'##', params[i].default);
    }
    return query;
}


function executeQuery(){
    //we always execute the query within the editor
    $("#tab1").html(".. Fetching the result. Please wait ..");
    var editor = getEditor();
    var code = editor.getSession().getValue();
    code = paramReplace(code);
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

           // $('#tab3link').click();
            try {
                qResult = JSON.parse(s);
                if (qChartDataOptions.datasets.length == 0)
                    setExampleQChartDataOptions(1);
                $('#tab3link').click();
                setupDiagram(qResult);
                $("#tab1").html("<code>" + JSON.stringify(qResult, null, 2) + "</code>");
            }
            catch (err){
                $('#tab1link').click();
                $("#tab1").html("<code>" + s + "</code>");
            }

        });
}

function initStylingForm(){
    var form = $('#styling-form');

    var diastyleselector = form.find('select[name=diastyle-diatype]');
    diastyleselector.change(function() {
        loadChartProperties();
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
        setDataRowsTo(actualRowCount+1);
    });

    form.find('#diastyle-removedatarow').on('click', function() {
        setDataRowsTo(actualRowCount-1);
    });

    datarowSetupClick();

    $.post("styling.php", {	content: 'getTypes'	}).done(function(data) {
        name2Types = JSON.parse(data);
    });
}

function loadChartProperties(){
    var form = $('#styling-form');
    var diastyleselector = form.find('select[name=diastyle-diatype]');
    $.post("styling.php", {
        content: 'getProperties',
        diatype: diastyleselector.val()
    }).done(function(data1) {
        form.find('select[name=diastyle-propchoser]').html(data1);
    });
}

function resetQChartDataOptions(){
    qChartDataOptions = {
        'labels' : [],
        'datasets' : []
    };
}

function setExampleQChartDataOptions(datarows){
    qChartDataOptions = {
        'labels' : [],
        'datasets' : []
    };
    for(var i = 0; i < datarows; i++){
        qChartDataOptions.datasets[i] = {
            'data' : [],
            'label' : ('data'+i),
            'fillColor' : getRandomCol()
        }
    }
}

function getRandomCol(){
    return 'rgba('+Math.round(255 * Math.random())+','+Math.round(255 * Math.random())+','+Math.round(255 * Math.random())+',0.5)';
}

function applyStyleClick(){
    saveOptionsObjFromDatarow(activeRowNo);
    setupDiagram(qResult);
    $("#tab2").html("<code>"+JSON.stringify(qChartDataOptions, null, 2)+"</code>");
}

function resetStyle2DefaultClick(){
    if(confirm('Do you really want to reset all the styles?')) {
        setExampleQChartDataOptions(1);
        $('#styling-form select[name=diastyle-diatype]').val('line');
        setupDiagram(qResult);
    }
}

function setDataRowsTo(newRowCount){
    newRowCount = newRowCount < 1 ? 1 : newRowCount;
    var diff = newRowCount - actualRowCount;
    if(diff > 0){
        for(var i = 0; i < diff; i++){
            var lastRowButton = $('#styling-form #diastyle-datarowbuttons button.datarowbtn:last');
            var rowno = parseInt(lastRowButton.attr('rowno'));
            lastRowButton.after(
                '<button type="button" class="btn btn-default datarowbtn" rowno="' +
                (rowno + 1) + '" id="diastyle-datarow-' + (rowno + 1) +
                '">Data Row ' + (rowno + 1) + '</button>');
        }
    }else if(diff < 0){
        var removediff = diff * (-1);
        for(var i = 0; i < removediff; i++){
            var lastRowButton = $('#styling-form #diastyle-datarowbuttons button.datarowbtn:last');
            var rowno = parseInt(lastRowButton.attr('rowno'));
            lastRowButton.remove();
        }
    }
    actualRowCount = newRowCount;
    datarowSetupClick();
}

//if we click on datarow button:
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


//styles the diagram from the options
//gets the data from the query result
//and initializes a new chart
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
    else
        activeChart = new Chart(chart1).Line(ddata, '{}');
}

function addProp2Table(name, val, type) {
    //don't add if its already there
    if ($('#styling-form #diastyle-proptable tr').filter(function() {
            return $(this).children().first().text() == name || name == 'data';
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


function addImportStatements(){
    var editor = ace.edit("editor");
    var cursor = editor.selection.getCursor();

    editor.gotoLine(1);

    if(typeof editor.find('jsoniq version "1.0";',{
            backwards: false,
            wrap: false,
            caseSensitive: false,
            wholeWord: false,
            regExp: false
        }) === 'undefined'){
        editor.insert('jsoniq version "1.0";\n');
        editor.insert("\n");
    }

    findAndInsert(editor, 'mongo2:', 'import module namespace mongo2="http://www.zorba-xquery.com/modules/mongo2";')

    editor.gotoLine(cursor['line']);
}

function findAndInsert(editor, trigger, insert){
    if(typeof editor.find(trigger,{
            backwards: false,
            wrap: false,
            caseSensitive: false,
            wholeWord: false,
            regExp: false
        }) !== 'undefined'){
        editor.gotoLine(1);
        if(typeof editor.find(insert,{
                backwards: false,
                wrap: false,
                caseSensitive: false,
                wholeWord: false,
                regExp: false
            }) === 'undefined'){

            editor.gotoLine(2);
            editor.insert(insert);

        }
    }
}

// PARAMS //

function initParamsForm(){
    $('#params-addparam').on('click', function(){
       var paramName = $('#params-form input[name=params-newparamname]').val();
        addParamToParamTable(paramName.toUpperCase(), "");
    });
}

function addParamToParamTable(paramName, paramValue){
    var idname = 'paramptable-'+paramName;
    var input = '<input type="text" id="' + idname + '" name="' + paramName +'" value="'+paramValue+'"></input>';
    var tt = $('#params-ptable tr:last');
    tt.after('<tr><td>' + paramName + '</td><td>' + input + '</td><td><button type="button" class="btn btn-default insertbutton"><span class="glyphicon glyphicon-italic" /></button><button type="button" class="btn btn-default removebutton"><span class="glyphicon glyphicon-remove" /></button></td></tr>');
    var tt2 = tt.next();
    tt2.find('button.insertbutton').on('click', function(){
        var input = $(this).parent().parent().find('input').first();
        var pName = input.attr('name');
        getEditor().insert('##'+pName+'##');
    });

    tt2.find('button.removebutton').on('click', function(){
        $(this).parent().parent().remove();
    });
}

function getParamsFromPTable(){
    var params = [];
    $('#params-ptable input').each(function(){
        params.push({
            'name' : $(this).attr('name'),
            'default' : $(this).val()
        });
    });
    return params;
}

function setParams(params){
    $('#params-ptable tr').not(':first').remove();
    if(typeof params !== 'string') {
        for (var i = 0; i < params.length; i++) {
            addParamToParamTable(params[i].name, params[i].default);
        }
    }
}

// LINK CREATOR //

function setEmbedLink(id, params){
    var linkWithoutParams = global_PAGEDIR+'/getChart.php?qid='+id+'&width=400&height=400';
    var linkWithParams = linkWithoutParams;
    for(var i = 0; i < params.length; i++){
        linkWithParams = linkWithParams + '&'+params[i].name+'='+params[i].default;
    }
    var linkWithParamsForce = linkWithParams+'&usecached=false';
    $('#embedlink-A').text(linkWithoutParams);
    $('#embedlink-A').next().find('a').first().attr('href', linkWithoutParams);
    $('#embedlink-B').text(linkWithParams);
    $('#embedlink-B').next().find('a').first().attr('href', linkWithParams);
    $('#embedlink-C').text(linkWithParamsForce);
    $('#embedlink-C').next().find('a').first().attr('href', linkWithParamsForce);
}


//Usefull global functions

//type: success, info, warning or danger
function setAlert(type, message){
  $('#topalertdiv')
    .html('<div class="alert alert-'+type+' alert-dismissible" role="alert">\n<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+message+'</div>');
}

function setQueryTitle(qname){
  $('#querytitle').text(qname);
}

function clearForms(){
    var editor = getEditor();
    editor.setValue("");
    activeQID = "";
    setQueryTitle("");
    $('#queryopt-form input[name=queryopt-qname]').val("");
    $('#queryopt-form input[name=queryopt-fname]').val("");
    $('#queryopt-form select[name=queryopt-refresh]').val(0);
    $('#queryopt-form select[name=queryopt-caching]').val(0);
}

function getEditor(){
  var editor = ace.edit("editor");
  return editor;
}
