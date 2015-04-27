<div class="modal fade bs-mongodb-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="gridSystemModalLabel">MongoDB Assistant</h4>
      </div>
      <div class="modal-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-8">
              <form id="modal-mongodb-form">
                <div class="form-group">
                  <label>Host & Port (eg: mongolab.com:27017)</label>
                  <input type="text" class="form-control" placeholder="Host Name">
                </div><div class="form-group">
                  <label>Username</label>
                  <input type="text" class="form-control" placeholder="user">
                </div><div class="form-group">
                  <label>User Source Collection DB</label>
                  <input type="text" class="form-control" placeholder="usersource">
                </div><div class="form-group">
                  <label>Password</label>
                  <input type="text" class="form-control" placeholder="password">
                </div><div class="form-group">
                  <label>Collection on which the query runs</label>
                  <input type="text" class="form-control" placeholder="querycollection">
                </div>
                <button type="button" class="btn btn-default" id="modal-mongodb-submit">Mongo DB-Assistant</button>
              </form>
            </div>
            <div class="col-md-3">

            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</div>
