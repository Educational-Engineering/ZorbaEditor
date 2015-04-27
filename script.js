var activeChart = null;
var qChartDataOptions = {
  'labels' : [],
  'datasets' : []
};
var qResult = "";
var activeQID = "";

$( document ).ready(function() {






  var substringMatcher = function(strs) {
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

  var fnames = [];
  var html = $.post( "querystoremanager.php", { action: 'jsonFolderList' })
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



  $('h4.expandable').on('click', function(e){
    var content = $(this).next();
    if($(this).hasClass('expanded')){
       $(this).removeClass('expanded').addClass('notexpanded');
       $(this).find('span.glyphicon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
       content.hide('fast');
     }
    else{
      $(this).removeClass('notexpanded').addClass('expanded');
      $(this).find('span.glyphicon').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
      content.show('fast');
    }
  });

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

  $('#button-checkimport').on('click', function(){
    addImportStatements();
  });



  $('#action-deletequery').on('click', function(){
    if(activeQID != ""){
      if(confirm("Do you really want to delete this query?")){
        var postdata = {
          action : 'deleteQuery',
          qid : activeQID
        };
        $.post( "querystoremanager.php", postdata).done(function( data ) {
            alert(data);
          });
      }
    }
  });

  $('#action-savequery').on('click', function(){
    var editor = ace.edit("editor");
    var postdata = {
        action: 'createQuery',
        qname: $('#queryopt-form input[name=queryopt-qname]').val(),
        parentfolder: $('#queryopt-form input[name=queryopt-fname]').val(),
        qcode: editor.getValue(),
        options: {
          'caching' : $('#queryopt-form select[name=queryopt-refresh]').val(),
          'refresh' : $('#queryopt-form select[name=queryopt-caching]').val(),
          'chartdata' : qChartDataOptions,
        }};
    $.post( "querystoremanager.php", postdata).done(function( data ) {
        alert(data);
      });
  });

  importFolderStructure();



});


$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});




// VARIOUS FUNCTIONS //

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

function setColorPicker(id){
  $(id).colpick({
  	layout:'hex',
  	submit:0,
  	colorScheme:'dark',
  	onChange:function(hsb,hex,rgb,el,bySetColor) {
  		$(el).css('border-color','#'+hex);
  		// Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
  		if(!bySetColor) $(el).val(hex);
  	}
  }).keyup(function(){
  	$(this).colpickSetColor(this.value);
  });
}



function importFolderStructure(){
  var postdata = {
    action: 'listQueries',
    beforeInnerFolder :  '<span class="glyphicon glyphicon-menu-down"></span>',
    afterInnerFolder:    '',
    beforeInnerQuery:    '<span class="glyphicon glyphicon-minus"></span>',
    afterInnerQuery:     '',
  };
  $.post( "querystoremanager.php", postdata).done(function( data ) {
      $('#querylist').html(data);


      $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
      $('.tree li.parent_li > span').on('click', function (e) {
          var children = $(this).parent('li.parent_li').find(' > ul > li');
          if (children.is(":visible")) {
              children.hide('fast');
              $(this).attr('title', 'Expand this branch').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
              //$(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
          } else {
              children.show('fast');
              $(this).attr('title', 'Collapse this branch').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
              //$(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
          }
          e.stopPropagation();
      });

      $('#querylist ul li ul li a').click(function(){
        var qid = $(this).attr("qid");
        var postdata = {
          action : 'getQuery',
          qid : qid
        };
        $.post( "querystoremanager.php", postdata).done(function( data ) {
            var editor = ace.edit("editor");
            var dataObj = JSON.parse(data);
            editor.setValue(dataObj.qcode);
            activeQID = dataObj.id;
            $('#queryopt-form input[name=queryopt-qname]').val(dataObj.qname);
            $('#queryopt-form input[name=queryopt-fname]').val(dataObj.parentFolder);
            $('#queryopt-form select[name=queryopt-refresh]').val(dataObj.options.refresh);
            $('#queryopt-form select[name=queryopt-caching]').val(dataObj.options.caching);
        });
      });

    });


}
