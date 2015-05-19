//script used by script2.js
//only Form interactions are done here
//the drawing is done in script2.js


//the options object consosts of:
// -charttyp [line, bar, etc.]
// -qChartOptionsA
// -qChartOptionsB
// ALL of these properties have to be set
var options = undefined;
var name2Types = undefined;
var activeRowNo = 1;

//callbacks
var cbApply = undefined;
var cbReset = undefined;

$(document).ready(function () {
    $.post("styling.php", {content: 'getTypes'}).done(function (data) {
        name2Types = JSON.parse(data);
    });
});

function loadStylingForm(cbLoadingFinished, cbApply1, cbReset1) {

    cbApply = cbApply1;
    cbReset = cbReset1;

    $.post("snippets/form-styling.php", {})
        .done(function (data) {
            $('#div-styling').html(data);
            var form = $('#styling-form');

            var diastyleselector = form.find('select[name=diastyle-diatype]');
            diastyleselector.change(function () {

                //load Chart properties
                var form = $('#styling-form');
                var diastyleselector = form.find('select[name=diastyle-diatype]');
                $.post("styling.php", {
                    content: 'getProperties',
                    diatype: diastyleselector.val()
                }).done(function (data1) {
                    form.find('select[name=diastyle-propchoser]').html(data1);
                });

                var diatype = form.find('select[name=diastyle-diatype]').val();
                var qChartOptionsIsA_OLD = currentChartOptionsIsA(options.charttyp);
                var qChartOptionsIsA = currentChartOptionsIsA(diatype);
                options.charttyp = diatype;
                if (qChartOptionsIsA_OLD != qChartOptionsIsA) {
                    if (qChartOptionsIsA) {
                        setDataRowsTo(options.chartdataA.datasets.length);
                        restoreDatarowFromOptionsObj(1);
                    } else {
                        setDataRowsTo(options.chartdataB.length);
                        restoreDatarowFromOptionsObj(1);
                    }
                }
            });

            if (typeof options != 'undefined' && options.hasOwnProperty('charttyp'))
                form.find('select[name=diastyle-diatype]').val(options.charttyp);

            form.find('#diastyle-addpropsingle').on('click', function () {
                var propChosen = form.find('select[name=diastyle-propchoser]').val();
                addProp2Table(propChosen, "", name2Types[propChosen]);
            });

            form.find('#diastyle-addpropall').on('click', function () {
                $('#styling-form select[name=diastyle-propchoser] option').each(function () {
                    addProp2Table($(this).val(), "", name2Types[$(this).val()]);
                });
            });

            form.find('#diastyle-proptable tr button').on('click', function (event) {
                $(this).parent().parent().remove();
            });


            //form.find('#diastyle-adddatarow').on('click', function () {
            //    setDataRowsTo(actualRowCount + 1);
            //});
            //
            //form.find('#diastyle-removedatarow').on('click', function () {
            //    setDataRowsTo(actualRowCount - 1);
            //});

            form.find('#action-diastyleapply').on('click', function () {
                applyStyleClick();
            });
            form.find('#action-diastylereset').on('click', function () {
                resetStyleClick();
            });

            datarowSetupClick();

            cbLoadingFinished();
        });
}

function setOptionsFromExisting(options2Set) {
    if (options2Set.hasOwnProperty('chartdataA') && options2Set.hasOwnProperty('chartdataB')) {
        options = options2Set;
        return true;
    } else {
        options = undefined;
        return false;
    }
}

function setNewOptionsFromQResult(qResObj) {
    options = {
        charttyp: 'line',
        chartdataA: {},
        chartdataB: {}
    };
    setExampleqChartDataOptionsA(getDatarowsFromResult(qResObj, true));
    setExampleqChartDataOptionsB(getDatarowsFromResult(qResObj, false));

    initFormValuesFromOptions(qResObj);

  /*  if ($('#styling-form').length > 0) {
        //init form with values
        initFormValuesFromOptions();
    }
    */
}

function initFormValuesFromOptions(qResObj){
    var form = $('#styling-form');
    form.find('select[name=diastyle-diatype]').val(options.charttyp);

    //load Chart properties
    $.post("styling.php", {
        content: 'getProperties',
        diatype: options.charttyp
    }).done(function (data1) {
        form.find('select[name=diastyle-propchoser]').html(data1);
    });

    var diatype = form.find('select[name=diastyle-diatype]').val();
    options.charttyp = diatype;
    setDataRowsTo(getDatarowsFromResult(qResObj, currentChartOptionsIsA(options.charttyp)));
    restoreDatarowFromOptionsObj(1);
}


function getOptionsStyling() {
    if(typeof options != 'undefined'){
        return options;
    }else{
        return {
            charttyp: 'line',
            chartdataA: {},
            chartdataB: {}
        };
    }
}

function getCharttyp() {
    if (typeof options === 'undefined')
        return 'line';
    else
        return options.charttyp;
}

function getOptionsForDiagram(qResult, charttyp) {
    if (typeof options === 'undefined')
        setNewOptionsFromQResult(qResult);

    if (currentChartOptionsIsA(charttyp)) {

        var ddata = options.chartdataA;
        ddata.labels = getColFromJSON(qResult, 'label')
        for (var dd in ddata.datasets) {
            var dataColInt = parseInt(dd) + 1;
            var dataArrayCol = getColFromJSON(qResult, 'data' + dataColInt);
            if (dataArrayCol.length > 0 && dd >= 0 && !(typeof dataArrayCol[0] === 'undefined'))
                ddata.datasets[dd]['data'] = dataArrayCol;
        }
        return ddata;

    } else {

        var ddata = options.chartdataB
        var rawData = getColFromJSON(qResult, 'data1');
        for (var i = 0; i < rawData.length; i++) {
            ddata[i]['value'] = rawData[i];
        }

        return ddata;
    }
}


function setExampleqChartDataOptionsA(datarows) {
    var qa = {
        'labels': [],
        'datasets': []
    };
    for (var i = 0; i < datarows; i++) {
        qa.datasets[i] = {
            'data': [],
            'label': ('data' + i),
            'fillColor': getRandomCol()
        }
    }
    options.chartdataA = qa;
}

function setExampleqChartDataOptionsB(datarows) {
    var qb = []
    for (var i = 0; i < datarows; i++) {
        qb[qb.length] = {
            'value': 0,
            'label': ('data' + i),
            'color': getRandomCol()
        }
    }
    options.chartdataB = qb;
}


function getRandomCol() {
    return 'rgba(' + Math.round(255 * Math.random()) + ',' + Math.round(255 * Math.random()) + ',' + Math.round(255 * Math.random()) + ',0.5)';
}

function getDatarowsFromResult(qresultObj, chartypeIsA) {
    if (chartypeIsA) {
        var rows = 1;
        while (qresultObj[0].hasOwnProperty('data' + (rows + 1))) {
            rows++;
        }
        return rows;
    }
    else {
        return Math.max(1, qresultObj.length)
    }
}


// ### HELPERS ###

function applyStyleClick() {

    saveOptionsObjFromDatarow(activeRowNo);

    cbApply();
}

function resetStyleClick() {
    if (confirm('Do you really want to reset all the styles?')) {
        //setExampleqChartDataOptionsA(1);
        //setExampleqChartDataOptionsB(1);

        $('#styling-form select[name=diastyle-diatype]').val('line');

        cbReset();
    }
}

function setDataRowsTo(newRowCount) {
    newRowCount = newRowCount < 1 ? 1 : newRowCount;
    var diff = newRowCount - actualRowCount;
    if (diff > 0) {
        for (var i = 0; i < diff; i++) {
            var lastRowButton = $('#styling-form #diastyle-datarowbuttons button.datarowbtn:last');
            var rowno = parseInt(lastRowButton.attr('rowno'));
            lastRowButton.after(
                '<button type="button" class="btn btn-default datarowbtn" rowno="' +
                (rowno + 1) + '" id="diastyle-datarow-' + (rowno + 1) +
                '">Data Row ' + (rowno + 1) + '</button>');
        }
    } else if (diff < 0) {
        var removediff = diff * (-1);
        for (var i = 0; i < removediff; i++) {
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
    $('#styling-form').find('#diastyle-datarowbuttons button.datarowbtn').on('click', function () {
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

function saveOptionsObjFromDatarow(rowno) {
    var opt = getOptionObjFromDatarow(rowno);
    if (currentChartOptionsIsA(options.charttyp))
        options.chartdataA.datasets[rowno - 1] = opt;
    else
        options.chartdataB[rowno - 1] = opt;
}

function restoreDatarowFromOptionsObj(rowno) {
    $('#styling-form #diastyle-proptable tr').not(':first').remove();
    if (currentChartOptionsIsA(options.charttyp)) {
        if (options.chartdataA.datasets.length > (rowno - 1)) {
            opt = options.chartdataA.datasets[rowno - 1];
            for (var propname in opt) {
                addProp2Table(propname, opt[propname], name2Types[propname]);
            }
        }
    } else {
        if (options.chartdataB.length > (rowno - 1)) {
            opt = options.chartdataB[rowno - 1];
            for (var propname in opt) {
                addProp2Table(propname, opt[propname], name2Types[propname]);
            }
        }
    }
}
function getOptionObjFromDatarow(rowno) {
    var o = {};
    $('#styling-form #diastyle-proptable tr').each(function () {
        var propname = $(this).find('td').first().text();
        var propinput = $(this).find('input[name=diastyle-proptable-' + propname + ']');
        var propval = "";
        if (propname != "") {
            if (propinput.hasClass('spectrum'))
                propval = propinput.spectrum('get').toRgbString();
            else
                propval = propinput.val();

            o[propname] = propval;
        }
    });
    return o;
}

function getColFromJSON(data, colname) {
    var res = [];
    var i;
    for (i = 0; i < data.length; i++) {
        res[res.length] = data[i][colname];
    }
    return res;
}


function addProp2Table(name, val, type) {
    //don't add if its already there
    if ($('#styling-form #diastyle-proptable tr').filter(function () {
            return $(this).children().first().text() == name || name == 'data' || name == 'value';
        }).length == 0) {
        var tt = $('#styling-form #diastyle-proptable tr:last');

        var idname = 'diastyle-proptable-' + name;

        var input = "";
        if (type == 'col')
            input = '<input type="text" id="' + idname + '" name="' + idname + '" class="spectrum" ></input>';
        if (type == 'text')
            input = '<input type="text" id="' + idname + '" name="' + idname + '" value="' + val + '"></input>';

        tt.after('<tr><td>' + name + '</td><td>' + input + '</td><td><button type="button" class="btn btn-default"><span class="glyphicon glyphicon-remove" /></button></td></tr>'
        );
        $('#styling-form #diastyle-proptable tr button').on('click', function (event) {
            $(this).parent().parent().remove();
        });
        if (type == 'col') {
            $('#' + idname).spectrum({
                color: val,
                preferredFormat: "hex",
                showInput: true,
                showAlpha: true
            });
        }
    }
}

function currentChartOptionsIsA(charttyp) {
    switch (charttyp) {
        case 'line':
        case 'bar':
        case 'radar':
            return true;
        case 'polar':
        case 'pie':
        case 'doughnut':
            return false;
        default:
            return true;
    }
}
