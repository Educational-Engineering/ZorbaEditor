<form id="styling-form">
  <div class="form-group">
    <label>Diagram Type</label>
    <select name="diastyle-diatype" class="form-control">
      <option value="0">Please select</option>
      <option value="line">Line Chart</option>
      <option value="bar">Bar Chart</option>
      <option value="radar">Radar Chart</option>
      <option value="polar">Polar Area Chart</option>
      <option value="pie">Pie Chart</option>
      <option value="doughnut">Doughnut Chart</option>
    </select>
  </div>
  <div class="form-group">
    <div class="btn-group" role="group" id="diastyle-datarowbuttons" >
      <button type="button" class="btn btn-default datarowbtn" rowno="0" id="diastyle-datarow-global" >Global</button>
      <button type="button" class="btn btn-default datarowbtn active" rowno="1" id="diastyle-datarow-1">Data Row 1</button>
     <!--<button type="button" class="btn btn-default" id="diastyle-removedatarow"><span class="glyphicon glyphicon-minus" /></button>
      <button type="button" class="btn btn-default" id="diastyle-adddatarow"><span class="glyphicon glyphicon-plus" /></button>-->
    </div>
  </div>
  <div class="form-group">
    <label>Add new property</label>
    <div class="input-group">
        <select name="diastyle-propchoser" class="form-control">
          <option value="0"> - Choose Diagram Type first - </option>
        </select>
        <span class="input-group-btn">
          <button type="button" class="btn btn-default" id="diastyle-addpropsingle"><span class="glyphicon glyphicon-plus" /></button>
          <button type="button" class="btn btn-default" id="diastyle-addpropall">Add all</button>
        </span>


      </div>
  </div>
  <table class="table" id="diastyle-proptable">
    <tbody>
      <tr>
        <th>Property</th>
        <th>Value</th>
        <th></th>
      </tr>

    </tbody>
  </table>

  <button type="button" class="btn" id="action-diastyleapply">Apply</button>
    <button type="button" class="btn" id="action-diastylereset">Reset</button>

</form>
