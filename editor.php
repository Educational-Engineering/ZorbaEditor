<?php
if(!defined('include_allowed')) {
    die('Direct access not permitted');
}
?>
<div class="container-fluid">
    <div class="row">
        <div class="col-sm-3 col-md-2 sidebar">

            <h4 class="div-inline">Saved Queries</h4>&nbsp;&nbsp;
            <span class="glyphicon glyphicon-refresh hoverable-icon" id="action-refreshquerylist"></span>&nbsp;&nbsp;
            <span class="glyphicon glyphicon-plus hoverable-icon" id="action-addnewquery"></span>
            <div id="querylist" class="tree">

            </div>
        </div>
        <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">

            <div class="row">
                <div class="col-md-8">
                    <div id="topalertdiv" >

                    </div>

                    <h2 class="page-header">
                        <small>
                            <span class="glyphicon glyphicon-save hoverable-icon" id="action-savequery"></span>
                            &nbsp;&nbsp;
                            <span class="glyphicon glyphicon-remove hoverable-icon" id="action-deletequery"></span>

                        </small>
                        &nbsp;-&nbsp;<span id="querytitle">Query</span>
                    </h2>
                    <div class="row">
                        &nbsp;&nbsp;&nbsp;

                    </div>

                    <div  id="editor"></div>

                    <br/>

                    <div class="row row-nomargin">

                        <div class="btn-group" role="group" >
                            <button id="action-executequery" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-play"></span>&nbsp;Execute</button>
                        </div>
                        <div class="btn-group" role="group" >
                            <button type="button" class="btn btn-default" data-toggle="modal" id="action-checkimport">Check Import Statements</button>
                        </div>

                        <div class="dropdown div-inline">
                            <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">
                                Add datasource
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                                <li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-toggle="modal" data-target=".bs-fileupload-modal-lg">Fileupload</a></li>
                                <li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-toggle="modal" data-target=".bs-mongodb-modal-lg">MongoDP</a></li>
                                <li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-toggle="modal" data-target=".bs-jdbc-modal-lg">JDBC (MySQL, etc.)</a></li>
                            </ul>
                        </div>

                        <div class="dropdown div-inline div-right">
                            <button id="action-savequery2" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-save"></span>&nbsp;Save</button>
                        </div>

                    </div>

                    <br/><br/>
                    <ul class="nav nav-tabs">
                        <li role="presentation">
                            <a href="#tab1" aria-controls="tab1" role="tab" data-toggle="tab" id="tab1link">Query Raw Result</a>
                        </li>
                        <li role="presentation">
                            <a href="#tab2" aria-controls="tab2" role="tab" data-toggle="tab">Raw Chart Options</a>
                        </li>
                        <li role="presentation" class="active">
                            <a href="#tab3" aria-controls="tab3" role="tab" data-toggle="tab" id="tab3link">Data Visual</a>
                        </li>
                        <li role="presentation">
                            <a href="#tab4" aria-controls="tab4" role="tab" data-toggle="tab">Embed Link</a>
                        </li>

                    </ul>

                    <!-- Tab panes -->
                    <div id="resulttabs" class="tab-content">
                        <div role="tabpanel" class="tab-pane" id="tab1">...</div>
                        <div role="tabpanel" class="tab-pane" id="tab2">...</div>
                        <div role="tabpanel" class="tab-pane active" id="tab3">
                            <canvas id="myChart" width="400" height="400">
                            </canvas>
                            <br/><br/>
                        </div>
                        <div role="tabpanel" class="tab-pane" id="tab4">
                            <br/>
                            <table id="embedtable">
                                <tbody>
                                <tr>
                                    <td>Link without params</td><td id="embedlink-A">save or load a query first</td>
                                    <td><a href="#" target="_blank">Go</a></td>
                                </tr>
                                <tr>
                                    <td>Link with params</td><td id="embedlink-B">save or load a query first</td>
                                    <td><a href="#" target="_blank">Go</a></td>
                                </tr>
                                <tr>
                                    <td>Link with params / No Cache</td><td id="embedlink-C">save or load a query first</td>
                                    <td><a href="#" target="_blank">Go</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>



                </div>
                <div class="col-md-4">

                    <h4 class="page-header expandable expanded"><span class="glyphicon glyphicon-menu-down"></span>&nbsp;Properties</h4>
                    <div class="bs-example" >
                        <form id="queryopt-form">
                            <div class="form-group">
                                <label>Query Name</label>
                                <input type="text" class="form-control" name="queryopt-qname" placeholder="Query Name">
                            </div><div class="form-group">
                                <label>Enter Folder Name or choose an existing (start typing)</label>
                                <input type="text" class="form-control typeahead" name="queryopt-fname" placeholder="Folder Name">
                            </div>
                            <div class="form-group">
                                <label>Refresh (autom. Neuberechnung)</label>
                                <select name="queryopt-refresh" class="form-control">
                                    <option value="0">Keine Neuberechnung</option>
                                    <option value="1440">24 Stunden</option>
                                    <option value="480">8 Stunden</option>
                                    <option value="60">1 Stunde</option>
                                    <option value="15">15 Minuten</option>
                                    <option value="5">5 Minuten</option>
                                </select>
                            </div><div class="form-group">
                                <label>Caching TTL</label>
                                <select name="queryopt-caching" class="form-control">
                                    <option value="0">kein Caching</option>
                                    <option value="-1">bis Refresh</option>
                                    <option value="1440">24 Stunden</option>
                                    <option value="480">8 Stunden</option>
                                    <option value="60">1 Stunde</option>
                                    <option value="15">15 Minuten</option>
                                    <option value="5">5 Minuten</option>
                                </select>
                            </div>
                        </form>
                    </div>


                    <h4 class="page-header expandable"><span class="glyphicon glyphicon-menu-down"></span>&nbsp;Params</h4>
                    <div class="bs-example" id="div-params" >
                        <?php include 'snippets/form-params.php'; ?>

                    </div>


                    <h4 class="page-header expandable"><span class="glyphicon glyphicon-menu-down"></span>&nbsp;Styling</h4>
                    <div class="bs-example" id="div-styling" >
                        <?php include 'snippets/form-styling.php'; ?>

                    </div>

                    <?php include 'snippets/modal-fileupload.php'; ?>
                    <?php include 'snippets/modal-mongodb.php'; ?>
                    <?php include 'snippets/modal-jdbc.php'; ?>
                    <?php include 'snippets/modal-folderrename.php'; ?>


                </div>
            </div>

            <br/><br/>




        </div>
    </div>
</div>
